import { getRouteParam } from '../../utils/getRouteParam';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { logger } from '../../utils/logger';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './user.service';
import { UserDirectory } from './user.directory';

const getAccounts = catchAsync(async (req, res) => {
  const result = await UserDirectory.getAccounts(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Accounts retrieved successfully',
    ...result,
  });
});

const getRoles = catchAsync(async (_req, res) => {
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Role guide retrieved successfully',
    data: await UserDirectory.getRoles(),
  });
});

const createStudent = catchAsync(async (req, res) => {
  const { password, student: studentData } = req.body;

  logger.info('Create student request received');

  const result = await UserServices.createStudent(req.file, password, studentData);

  logger.info('Student created successfully', { studentId: result[0]?.id });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student created successfully',
    data: result,
  });
});

const createFaculty = catchAsync(async (req, res) => {
  const { password, faculty: facultyData } = req.body;

  logger.info('Create faculty request received');

  const result = await UserServices.createFaculty(req.file, password, facultyData);

  logger.info('Faculty created successfully', { facultyId: result[0]?.id });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Faculty created successfully',
    data: result,
  });
});

const createAdmin = catchAsync(async (req, res) => {
  const { password, admin: adminData } = req.body;

  logger.info('Create admin request received');

  const result = await UserServices.createAdmin(req.file, password, adminData);

  logger.info('Admin created successfully', {
    adminId: result[0]?.id,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin created successfully',
    data: result,
  });
});

const getMe = catchAsync(async (req, res) => {
  const { userId, role } = req.user;
  const result = await UserServices.getMe(userId, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User retrieved successfully',
    data: result,
  });
});

const changeStatus = catchAsync(async (req, res) => {
  const id = getRouteParam(req, 'id');

  const result = await UserServices.changeStatus(id, req.body, {
    userId: req.user.userId,
    role: req.user.role,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Status updated successfully',
    data: result,
  });
});

export const UserControllers = {
  getAccounts,
  getRoles,
  createStudent,
  createFaculty,
  createAdmin,
  getMe,
  changeStatus,
};
