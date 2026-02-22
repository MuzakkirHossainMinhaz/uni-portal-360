import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { NotificationServices } from './notification.service';

const getUserNotifications = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await NotificationServices.getUserNotifications(userId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notifications retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const markAsRead = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;
  const result = await NotificationServices.markAsRead(id, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification marked as read',
    data: result,
  });
});

const markAllAsRead = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await NotificationServices.markAllAsRead(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All notifications marked as read',
    data: result,
  });
});

const deleteNotification = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;
  const result = await NotificationServices.deleteNotification(id, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification deleted successfully',
    data: result,
  });
});

export const NotificationControllers = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
