import { getPagination } from '../../utils/pagination';
import { randomUUID } from 'crypto';
import httpStatus from 'http-status';
import type { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import { logger } from '../../utils/logger';
import { AcademicSemester } from '../AcademicSemester/academicSemester.model';
import { NotificationServices } from '../Notification/notification.service';
import { Student } from '../Student/student.model';
import type { TFee } from './fee.interface';
import { Fee } from './fee.model';

type FeeChanges = Partial<Pick<TFee, 'type' | 'amount' | 'dueDate' | 'description'>>;

const todayUTC = () => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today;
};

const applyStatusFilter = (filter: Record<string, unknown>, status: unknown) => {
  if (status === 'OVERDUE') filter.$or = [{ status: 'OVERDUE' }, { status: 'PENDING', dueDate: { $lt: todayUTC() } }];
  else if (status === 'PENDING') {
    filter.status = 'PENDING';
    filter.dueDate = { $gte: todayUTC() };
  } else if (status === 'PAID' || status === 'PARTIAL') filter.status = status;
};

const feePage = async (filter: Record<string, unknown>, query: Record<string, unknown>, includeStudent: boolean) => {
  const { page, limit, skip } = getPagination(query);
  let find = Fee.find({ ...filter, isDeleted: { $ne: true } })
    .populate('academicSemester', 'name year')
    .sort({ dueDate: 1, _id: 1 })
    .skip(skip)
    .limit(limit);
  if (includeStudent) find = find.populate('student', 'id name');
  const [records, total] = await Promise.all([find, Fee.countDocuments({ ...filter, isDeleted: { $ne: true } })]);
  const today = todayUTC();
  const data = records.map((record) => {
    const item = record.toJSON();
    if (item.status === 'PENDING' && item.dueDate < today) item.status = 'OVERDUE';
    return item;
  });
  const totalPages = Math.ceil(total / limit) || 1;
  return { data, meta: { page, limit, total, totalPages, hasNext: page < totalPages } };
};

const createFee = async (payload: TFee) => {
  const [student, semester] = await Promise.all([
    Student.findById(payload.student).select('user id'),
    AcademicSemester.exists({ _id: payload.academicSemester }),
  ]);
  if (!student) throw new AppError(httpStatus.NOT_FOUND, 'Student not found');
  if (!semester) throw new AppError(httpStatus.NOT_FOUND, 'Academic semester not found');

  const result = await Fee.create(payload);
  if (student.user) {
    try {
      await NotificationServices.createNotification({
        userId: student.user as Types.ObjectId,
        title: 'New Fee Generated',
        message: `A new ${payload.type} fee of ${payload.amount} is due on ${new Date(payload.dueDate).toLocaleDateString()}.`,
        type: 'GENERAL',
        priority: 'HIGH',
        read: false,
        isDeleted: false,
        actionUrl: '/student/fees',
      });
    } catch (error) {
      logger.error('Fee created, but student notification failed', error);
    }
  }
  return result;
};

const getAllFees = async (query: Record<string, unknown>) => {
  const filter: Record<string, unknown> = {};
  if (query.studentId) {
    const student = await Student.findOne({ id: String(query.studentId) }).select('_id');
    if (!student) {
      const { page, limit } = getPagination(query);
      return { data: [], meta: { page, limit, total: 0, totalPages: 1, hasNext: false } };
    }
    filter.student = student._id;
  }
  applyStatusFilter(filter, query.status);
  if (query.type) filter.type = query.type;
  return feePage(filter, query, true);
};

const getMyFees = async (userId: string, query: Record<string, unknown>) => {
  const student = await Student.findOne({ id: userId }).select('_id');
  if (!student) throw new AppError(httpStatus.NOT_FOUND, 'Student not found');
  const filter: Record<string, unknown> = { student: student._id };
  applyStatusFilter(filter, query.status);
  if (query.type) filter.type = query.type;
  return feePage(filter, query, true);
};

const getMyFeeSummary = async (userId: string) => {
  const student = await Student.findOne({ id: userId }).select('_id');
  if (!student) throw new AppError(httpStatus.NOT_FOUND, 'Student not found');
  const [summary] = await Fee.aggregate<{ unpaidAmount: number; unpaidCount: number }>([
    { $match: { student: student._id, isDeleted: { $ne: true }, status: { $in: ['PENDING', 'OVERDUE', 'PARTIAL'] } } },
    { $group: { _id: null, unpaidAmount: { $sum: '$amount' }, unpaidCount: { $sum: 1 } } },
  ]);
  return { unpaidAmount: summary?.unpaidAmount ?? 0, unpaidCount: summary?.unpaidCount ?? 0 };
};

const editableFee = async (id: string) => {
  const fee = await Fee.findById(id);
  if (!fee) throw new AppError(httpStatus.NOT_FOUND, 'Fee not found');
  if (fee.status !== 'PENDING' && fee.status !== 'OVERDUE') {
    throw new AppError(httpStatus.CONFLICT, 'Only unpaid fees can be changed');
  }
  return fee;
};

const updateFee = async (id: string, payload: FeeChanges) => {
  await editableFee(id);
  const result = await Fee.findOneAndUpdate(
    { _id: id, status: { $in: ['PENDING', 'OVERDUE'] }, isDeleted: { $ne: true } },
    payload,
    { returnDocument: 'after', runValidators: true },
  );
  if (!result) throw new AppError(httpStatus.CONFLICT, 'Fee changed while editing; please refresh');
  return result;
};

const deleteFee = async (id: string) => {
  await editableFee(id);
  const result = await Fee.findOneAndUpdate(
    { _id: id, status: { $in: ['PENDING', 'OVERDUE'] }, isDeleted: { $ne: true } },
    { isDeleted: true },
    { returnDocument: 'after' },
  );
  if (!result) throw new AppError(httpStatus.CONFLICT, 'Fee changed while voiding; please refresh');
  return result;
};

const payFee = async (feeId: string, userId: string) => {
  const student = await Student.findOne({ id: userId }).select('_id');
  if (!student) throw new AppError(httpStatus.NOT_FOUND, 'Student not found');
  const result = await Fee.findOneAndUpdate(
    { _id: feeId, student: student._id, status: { $in: ['PENDING', 'OVERDUE'] }, isDeleted: { $ne: true } },
    { status: 'PAID', paidDate: new Date(), transactionId: `SIM-${randomUUID()}` },
    { returnDocument: 'after', runValidators: true },
  );
  if (!result) throw new AppError(httpStatus.CONFLICT, 'Fee is unavailable or already paid');
  return result;
};

export const FeeServices = { createFee, getAllFees, getMyFees, getMyFeeSummary, updateFee, deleteFee, payFee };
