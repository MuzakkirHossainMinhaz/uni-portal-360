import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AttendanceServices } from './attendance.service';

const createAttendance = catchAsync(async (req, res) => {
  const { userId } = req.user; // Faculty ID
  const result = await AttendanceServices.createAttendanceIntoDB(req.body, userId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Attendance marked successfully',
    data: result,
  });
});

const getMyAttendance = catchAsync(async (req, res) => {
  const { userId } = req.user; // Student ID
  const result = await AttendanceServices.getStudentAttendance(userId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My attendance records retrieved successfully',
    meta: result.meta,
    data: result.result,
  });
});

const getAttendanceReport = catchAsync(async (req, res) => {
  const result = await AttendanceServices.getAttendanceReport(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Attendance report retrieved successfully',
    meta: result.meta,
    data: result.result,
  });
});

const getLowAttendanceStudents = catchAsync(async (req, res) => {
  const threshold = req.query.threshold ? Number(req.query.threshold) : undefined;
  const result = await AttendanceServices.getLowAttendanceStudents(threshold);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Low attendance students retrieved successfully',
    data: result,
  });
});

const getAttendanceAnalytics = catchAsync(async (req, res) => {
    const result = await AttendanceServices.getAttendanceAnalytics();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Attendance analytics retrieved successfully',
        data: result
    })
})

export const AttendanceControllers = {
  createAttendance,
  getMyAttendance,
  getAttendanceReport,
  getLowAttendanceStudents,
  getAttendanceAnalytics
};

