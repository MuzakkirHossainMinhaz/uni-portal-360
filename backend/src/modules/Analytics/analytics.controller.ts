import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AnalyticsServices } from './analytics.service';

const getDashboardStats = catchAsync(async (req, res) => {
  const result = await AnalyticsServices.getDashboardStats();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard stats retrieved successfully',
    data: result,
  });
});

const getEnrollmentTrends = catchAsync(async (req, res) => {
  const result = await AnalyticsServices.getEnrollmentTrends(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Enrollment trends retrieved successfully',
    data: result,
  });
});

const getPassRateAnalytics = catchAsync(async (req, res) => {
  const result = await AnalyticsServices.getPassRateAnalytics();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Pass rate analytics retrieved successfully',
    data: result,
  });
});

export const AnalyticsControllers = {
  getDashboardStats,
  getEnrollmentTrends,
  getPassRateAnalytics,
};
