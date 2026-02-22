import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';
import { AnalyticsControllers } from './analytics.controller';

const router = express.Router();

router.get(
  '/dashboard-stats',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  AnalyticsControllers.getDashboardStats,
);

router.get(
  '/enrollment-trends',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  AnalyticsControllers.getEnrollmentTrends,
);

router.get(
  '/pass-rate',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  AnalyticsControllers.getPassRateAnalytics,
);

export const AnalyticsRoutes = router;
