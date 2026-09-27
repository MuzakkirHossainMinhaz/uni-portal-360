import { getRouteParam } from '../../utils/getRouteParam';
import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { OfferedCourseServices } from './offeredCourse.service';

const createOfferedCourse = catchAsync(async (req: Request, res: Response) => {
  const result = await OfferedCourseServices.createOfferedCourse(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offered course created successfully',
    data: result,
  });
});

const getAllOfferedCourses = catchAsync(async (req: Request, res: Response) => {
  const result = await OfferedCourseServices.getAllOfferedCourses(
    req.query,
    req.user.role === 'faculty' ? req.user.userId : undefined,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offered courses retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getMyOfferedCourses = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const result = await OfferedCourseServices.getMyOfferedCourses(userId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offered courses retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleOfferedCourse = catchAsync(async (req: Request, res: Response) => {
  const id = getRouteParam(req, 'id');
  const result = await OfferedCourseServices.getSingleOfferedCourse(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offered course fetched successfully',
    data: result,
  });
});

const updateOfferedCourse = catchAsync(async (req: Request, res: Response) => {
  const id = getRouteParam(req, 'id');

  const result = await OfferedCourseServices.updateOfferedCourse(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offered course updated successfully',
    data: result,
  });
});

const deleteOfferedCourse = catchAsync(async (req: Request, res: Response) => {
  const id = getRouteParam(req, 'id');
  const result = await OfferedCourseServices.deleteOfferedCourse(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offered course deleted successfully',
    data: result,
  });
});

export const OfferedCourseControllers = {
  createOfferedCourse,
  getAllOfferedCourses,
  getMyOfferedCourses,
  getSingleOfferedCourse,
  updateOfferedCourse,
  deleteOfferedCourse,
};
