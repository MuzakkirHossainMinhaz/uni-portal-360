import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AcademicSemesterServices } from './academicSemester.service';

const createAcademicSemester = catchAsync(async (req, res) => {
  const result = await AcademicSemesterServices.createAcademicSemesterIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Academic semester is created successfully',
    data: result,
  });
});

const getAllAcademicSemesters = catchAsync(async (req, res) => {
  const result = await AcademicSemesterServices.getAllAcademicSemestersFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Academic semesters are retrieved successfully',
    meta: result.meta,
    data: result.result,
  });
});

const getSingleAcademicSemester = catchAsync(async (req, res) => {
  const { semesterId } = req.params;

  const result = await AcademicSemesterServices.getSingleAcademicSemesterFromDB(semesterId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Academic semester is retrieved successfully',
    data: result,
  });
});

const updateAcademicSemester = catchAsync(async (req, res) => {
  const { semesterId } = req.params;
  const result = await AcademicSemesterServices.updateAcademicSemesterIntoDB(semesterId as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Academic semester is updated successfully',
    data: result,
  });
});

const deleteAcademicSemester = catchAsync(async (req, res) => {
  const { semesterId } = req.params;
  const result = await AcademicSemesterServices.deleteAcademicSemesterFromDB(semesterId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Academic semester is deleted successfully',
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
