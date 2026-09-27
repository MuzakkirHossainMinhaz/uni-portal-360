import { getRouteParam } from '../../utils/getRouteParam';
import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SemesterRegistrationServices } from './semesterRegistration.service';

const createSemesterRegistration = catchAsync(async (req: Request, res: Response) => {
  const result = await SemesterRegistrationServices.createSemesterRegistration(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Semester registration created successfully',
    data: result,
  });
});

const getAllSemesterRegistrations = catchAsync(async (req: Request, res: Response) => {
  const result = await SemesterRegistrationServices.getAllSemesterRegistrations(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Semester registration retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleSemesterRegistration = catchAsync(async (req: Request, res: Response) => {
  const id = getRouteParam(req, 'id');

  const result = await SemesterRegistrationServices.getSingleSemesterRegistrations(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Semester registration retrieved successfully',
    data: result,
  });
});

const updateSemesterRegistration = catchAsync(async (req: Request, res: Response) => {
  const id = getRouteParam(req, 'id');
  const result = await SemesterRegistrationServices.updateSemesterRegistration(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Semester registration updated successfully',
    data: result,
  });
});

const deleteSemesterRegistration = catchAsync(async (req: Request, res: Response) => {
  const id = getRouteParam(req, 'id');
  const result = await SemesterRegistrationServices.deleteSemesterRegistration(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Semester registration updated successfully',
    data: result,
  });
});

export const SemesterRegistrationControllers = {
  createSemesterRegistration,
  getAllSemesterRegistrations,
  getSingleSemesterRegistration,
  updateSemesterRegistration,
  deleteSemesterRegistration,
};
