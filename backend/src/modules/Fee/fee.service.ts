import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
import { Student } from '../Student/student.model';
import { Fee } from './fee.model';
import { TFee } from './fee.interface';
import { NotificationServices } from '../Notification/notification.service';
import { User } from '../User/user.model';

const createFee = async (payload: TFee) => {
  const student = await Student.findById(payload.student).populate('user');
  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student not found');
  }

  const result = await Fee.create(payload);

  // Notify student
  if (student.user) {
    await NotificationServices.createNotification({
      userId: (student.user as any)._id,
      title: 'New Fee Generated',
      message: `A new fee of ${payload.amount} for ${payload.type} has been generated. Due date: ${new Date(payload.dueDate).toLocaleDateString()}`,
      type: 'GENERAL',
      priority: 'HIGH',
      read: false,
      isDeleted: false,
      actionUrl: '/student/fees',
    });
  }

  return result;
};

const getAllFees = async (query: Record<string, unknown>) => {
  const { studentId, status, type, page = 1, limit = 10 } = query;
  const filter: Record<string, any> = {};

  if (studentId) {
      // If studentId is passed (likely the 'id' string e.g. 2026...), resolve to _id
      const student = await Student.findOne({ id: studentId });
      if (student) filter.student = student._id;
  }
  
  if (status) filter.status = status;
  if (type) filter.type = type;

  const skip = (Number(page) - 1) * Number(limit);

  const result = await Fee.find(filter)
    .populate('student')
    .populate('academicSemester')
    .sort({ dueDate: 1 }) // Soonest due first
    .skip(skip)
    .limit(Number(limit));

  const total = await Fee.countDocuments(filter);

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
    },
    data: result,
  };
};

const getMyFees = async (userId: string, query: Record<string, unknown>) => {
    const student = await Student.findOne({ id: userId });
    if (!student) {
        throw new AppError(httpStatus.NOT_FOUND, 'Student not found');
    }

    const { status, type, page = 1, limit = 10 } = query;
    const filter: Record<string, any> = { student: student._id };

    if (status) filter.status = status;
    if (type) filter.type = type;

    const skip = (Number(page) - 1) * Number(limit);

    const result = await Fee.find(filter)
        .populate('academicSemester')
        .sort({ dueDate: 1 })
        .skip(skip)
        .limit(Number(limit));

    const total = await Fee.countDocuments(filter);

    return {
        meta: {
            page: Number(page),
            limit: Number(limit),
            total,
        },
        data: result,
    };
};

const payFee = async (feeId: string, paymentDetails: { transactionId: string }) => {
    const fee = await Fee.findById(feeId);
    if (!fee) {
        throw new AppError(httpStatus.NOT_FOUND, 'Fee not found');
    }

    if (fee.status === 'PAID') {
        throw new AppError(httpStatus.BAD_REQUEST, 'Fee is already paid');
    }

    const updatedFee = await Fee.findByIdAndUpdate(
        feeId,
        {
            status: 'PAID',
            paidDate: new Date(),
            transactionId: paymentDetails.transactionId,
        },
        { new: true }
    );

    return updatedFee;
};

export const FeeServices = {
  createFee,
  getAllFees,
  getMyFees,
  payFee,
};
