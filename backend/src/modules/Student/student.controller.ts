import { getRouteParam } from '../../utils/getRouteParam';
import type { RequestHandler } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StudentServices } from './student.service';

const getSingleStudent = catchAsync(async (req, res) => {
  const id = getRouteParam(req, 'id');
  const result = await StudentServices.getSingleStudent(id, {
    userId: req.user.userId,
    role: req.user.role,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student retrieved successfully',
    data: result,
  });
});

const getAllStudents: RequestHandler = catchAsync(async (req, res) => {
  const result = await StudentServices.getAllStudents(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const updateStudent = catchAsync(async (req, res) => {
  const id = getRouteParam(req, 'id');
  const { student } = req.body;
  const result = await StudentServices.updateStudent(id, student);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student updated successfully',
    data: result,
  });
});

const deleteStudent = catchAsync(async (req, res) => {
  const id = getRouteParam(req, 'id');
  const result = await StudentServices.deleteStudent(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student deleted successfully',
    data: result,
  });
});

export const StudentControllers = {
  getAllStudents,
  getSingleStudent,
  deleteStudent,
  updateStudent,
};
