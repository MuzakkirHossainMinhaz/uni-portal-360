import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';
import { NotificationControllers } from './notification.controller';

const router = express.Router();

router.get(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.faculty, USER_ROLE.student),
  NotificationControllers.getUserNotifications,
);

router.patch(
  '/:id/read',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.faculty, USER_ROLE.student),
  NotificationControllers.markAsRead,
);

router.patch(
  '/read-all',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.faculty, USER_ROLE.student),
  NotificationControllers.markAllAsRead,
);

router.delete(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.faculty, USER_ROLE.student),
  NotificationControllers.deleteNotification,
);

export const NotificationRoutes = router;
