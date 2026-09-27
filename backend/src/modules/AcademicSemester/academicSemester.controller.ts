import { getRouteParam } from '../../utils/getRouteParam';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AcademicSemesterServices } from './academicSemester.service';

const createAcademicSemester = catchAsync(async (req, res) => {
  const result = await AcademicSemesterServices.createAcademicSemester(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Academic semester created successfully',
    data: result,
  });
});

const getAllAcademicSemesters = catchAsync(async (req, res) => {
  const result = await AcademicSemesterServices.getAllAcademicSemesters(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Academic semesters retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleAcademicSemester = catchAsync(async (req, res) => {
  const semesterId = getRouteParam(req, 'semesterId');

  const result = await AcademicSemesterServices.getSingleAcademicSemester(semesterId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Academic semester retrieved successfully',
    data: result,
  });
});

const updateAcademicSemester = catchAsync(async (req, res) => {
  const semesterId = getRouteParam(req, 'semesterId');
  const result = await AcademicSemesterServices.updateAcademicSemester(semesterId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Academic semester updated successfully',
    data: result,
  });
});

const deleteAcademicSemester = catchAsync(async (req, res) => {
  const semesterId = getRouteParam(req, 'semesterId');
  const result = await AcademicSemesterServices.deleteAcademicSemester(semesterId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Academic semester deleted successfully',
    data: result,
  });
});

export const AcademicSemesterControllers = {
  createAcademicSemester,
  getAllAcademicSemesters,
  getSingleAcademicSemester,
  updateAcademicSemester,
  deleteAcademicSemester,
};
