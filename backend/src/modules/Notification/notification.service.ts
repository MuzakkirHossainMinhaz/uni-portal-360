import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { User } from '../User/user.model';
import { TNotification } from './notification.interface';
import { Notification } from './notification.model';

const createNotification = async (payload: TNotification) => {
  const result = await Notification.create(payload);
  return result;
};

const getUserNotifications = async (userId: string, query: Record<string, unknown>) => {
  const user = await User.findOne({ id: userId });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const limit = Number(query.limit) || 20;
  const page = Number(query.page) || 1;
  const skip = (page - 1) * limit;

  const result = await Notification.find({ userId: user._id, isDeleted: false })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments({ userId: user._id, isDeleted: false });
  const unreadCount = await Notification.countDocuments({ userId: user._id, read: false, isDeleted: false });

  return {
    meta: {
      page,
      limit,
      total,
      unreadCount,
    },
    data: result,
  };
};

const markAsRead = async (id: string, userId: string) => {
  const user = await User.findOne({ id: userId });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId: user._id },
    { read: true },
    { new: true },
  );

  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, 'Notification not found');
  }

  return notification;
};

const markAllAsRead = async (userId: string) => {
  const user = await User.findOne({ id: userId });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  await Notification.updateMany({ userId: user._id, read: false }, { read: true });

  return { message: 'All notifications marked as read' };
};

const deleteNotification = async (id: string, userId: string) => {
  const user = await User.findOne({ id: userId });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId: user._id },
    { isDeleted: true },
    { new: true },
  );

  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, 'Notification not found');
  }

  return notification;
};

export const NotificationServices = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
