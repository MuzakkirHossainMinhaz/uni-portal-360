import { getPagination } from '../../utils/pagination';
import { randomUUID } from 'crypto';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import type { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import { AcademicSemester } from '../AcademicSemester/academicSemester.model';
import { AuditLog } from '../AuditLog/auditLog.model';
import { NotificationServices } from '../Notification/notification.service';
import { Student } from '../Student/student.model';
import { User } from '../User/user.model';
import type { TFee } from './fee.interface';
import { Fee } from './fee.model';

type FeeChanges = Partial<Pick<TFee, 'type' | 'amount' | 'dueDate' | 'description'>>;

const auditFee = async (
  session: mongoose.ClientSession,
  actorId: string | undefined,
  action: string,
  feeId: string,
  oldValues?: Record<string, unknown>,
  newValues?: Record<string, unknown>,
) => {
  if (!actorId) return;
  const actor = await User.findOne({ id: actorId }).select('_id').session(session);
  if (!actor) throw new AppError(httpStatus.UNAUTHORIZED, 'Fee actor no longer exists');
  await AuditLog.create(
    [
      {
        userId: actor._id,
        action,
        entityType: 'fees',
        entityId: feeId,
        oldValues,
        newValues,
        severity: 'HIGH',
        status: 'SUCCESS',
      },
    ],
    { session },
  );
};

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

const createFee = async (payload: TFee, actorId?: string) => {
  const [student, semester] = await Promise.all([
    Student.findById(payload.student).select('user id'),
    AcademicSemester.exists({ _id: payload.academicSemester }),
  ]);
  if (!student) throw new AppError(httpStatus.NOT_FOUND, 'Student not found');
  if (!semester) throw new AppError(httpStatus.NOT_FOUND, 'Academic semester not found');

  const session = await mongoose.startSession();
  try {
    return await session.withTransaction(async () => {
      const [result] = await Fee.create([payload], { session });
      await auditFee(session, actorId, 'CREATE_FEE', String(result._id), undefined, {
        student: String(result.student),
        academicSemester: String(result.academicSemester),
        type: result.type,
        amount: result.amount,
        dueDate: result.dueDate,
        status: result.status,
      });
      if (student.user)
        await NotificationServices.createNotification(
          {
            userId: student.user as Types.ObjectId,
            title: 'New Fee Generated',
            message: `A new ${payload.type} fee of ${payload.amount} is due on ${new Date(payload.dueDate).toLocaleDateString()}.`,
            type: 'GENERAL',
            priority: 'HIGH',
            read: false,
            isDeleted: false,
            actionUrl: '/student/fees',
          },
          session,
        );
      return result;
    });
  } finally {
    await session.endSession();
  }
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

const editableFee = async (id: string, session?: mongoose.ClientSession) => {
  const fee = await Fee.findById(id).session(session ?? null);
  if (!fee) throw new AppError(httpStatus.NOT_FOUND, 'Fee not found');
  if (fee.status !== 'PENDING' && fee.status !== 'OVERDUE') {
    throw new AppError(httpStatus.CONFLICT, 'Only unpaid fees can be changed');
  }
  return fee;
};

const updateFee = async (id: string, payload: FeeChanges, actorId?: string) => {
  const session = await mongoose.startSession();
  try {
    return await session.withTransaction(async () => {
      const previous = await editableFee(id, session);
      const result = await Fee.findOneAndUpdate(
        { _id: id, status: { $in: ['PENDING', 'OVERDUE'] }, isDeleted: { $ne: true } },
        payload,
        { session, returnDocument: 'after', runValidators: true },
      );
      if (!result) throw new AppError(httpStatus.CONFLICT, 'Fee changed while editing; please refresh');
      await auditFee(
        session,
        actorId,
        'UPDATE_FEE',
        id,
        { type: previous.type, amount: previous.amount, dueDate: previous.dueDate, description: previous.description },
        { type: result.type, amount: result.amount, dueDate: result.dueDate, description: result.description },
      );
      return result;
    });
  } finally {
    await session.endSession();
  }
};

const deleteFee = async (id: string, actorId?: string) => {
  const session = await mongoose.startSession();
  try {
    return await session.withTransaction(async () => {
      const previous = await editableFee(id, session);
      const result = await Fee.findOneAndUpdate(
        { _id: id, status: { $in: ['PENDING', 'OVERDUE'] }, isDeleted: { $ne: true } },
        { isDeleted: true },
        { session, returnDocument: 'after' },
      );
      if (!result) throw new AppError(httpStatus.CONFLICT, 'Fee changed while voiding; please refresh');
      await auditFee(
        session,
        actorId,
        'VOID_FEE',
        id,
        { amount: previous.amount, status: previous.status },
        { isDeleted: true },
      );
      return result;
    });
  } finally {
    await session.endSession();
  }
};

const payFee = async (feeId: string, userId: string) => {
  if (!['development', 'test'].includes(process.env.NODE_ENV?.toLowerCase() ?? '')) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      'Online payment is unavailable until a verified provider is configured',
    );
  }
  const student = await Student.findOne({ id: userId }).select('_id');
  if (!student) throw new AppError(httpStatus.NOT_FOUND, 'Student not found');
  const session = await mongoose.startSession();
  try {
    return await session.withTransaction(async () => {
      const previous = await Fee.findOne({
        _id: feeId,
        student: student._id,
        status: { $in: ['PENDING', 'OVERDUE'] },
        isDeleted: { $ne: true },
      }).session(session);
      if (!previous) throw new AppError(httpStatus.CONFLICT, 'Fee is unavailable or already paid');
      const result = await Fee.findOneAndUpdate(
        { _id: feeId, student: student._id, status: { $in: ['PENDING', 'OVERDUE'] }, isDeleted: { $ne: true } },
        { status: 'PAID', paidDate: new Date(), transactionId: `SIM-${randomUUID()}` },
        { session, returnDocument: 'after', runValidators: true },
      );
      if (!result) throw new AppError(httpStatus.CONFLICT, 'Fee is unavailable or already paid');
      await auditFee(
        session,
        userId,
        'SIMULATED_PAYMENT',
        feeId,
        { status: previous.status, amount: previous.amount },
        { status: result.status, transactionId: result.transactionId, paidDate: result.paidDate },
      );
      return result;
    });
  } finally {
    await session.endSession();
  }
};

export const FeeServices = { createFee, getAllFees, getMyFees, getMyFeeSummary, updateFee, deleteFee, payFee };
