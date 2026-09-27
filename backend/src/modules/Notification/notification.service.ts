import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { getPagination } from '../../utils/pagination';
import { User } from '../User/user.model';
import type { TNotification } from './notification.interface';
import { Notification } from './notification.model';

const createNotification = async (payload: TNotification) => {
  const result = await Notification.create(payload);
  return result;
};
const createNotifications = (payloads: TNotification[]) => Notification.insertMany(payloads);

const getUserNotifications = async (userId: string, query: Record<string, unknown>) => {
  const user = await User.findOne({ id: userId });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const { limit, page, skip } = getPagination(query, 20);

  const result = await Notification.find({ userId: user._id, isDeleted: false })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments({ userId: user._id, isDeleted: false });
  const unreadCount = await Notification.countDocuments({ userId: user._id, read: false, isDeleted: false });
  const totalPages = Math.ceil(total / limit) || 1;
  const hasNext = page < totalPages;

  return {
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext,
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
    { returnDocument: 'after' },
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
    { returnDocument: 'after' },
  );

  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, 'Notification not found');
  }

  return notification;
};

export const NotificationServices = {
  createNotifications,
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
