import { getRouteParam } from '../../utils/getRouteParam';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AcademicDepartmentServices } from './academicDepartment.service';

const createAcademicDepartment = catchAsync(async (req, res) => {
  const result = await AcademicDepartmentServices.createAcademicDepartment(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Academic department created successfully',
    data: result,
  });
});

const getAllAcademicDepartments = catchAsync(async (req, res) => {
  const result = await AcademicDepartmentServices.getAllAcademicDepartments(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Academic departments retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleAcademicDepartment = catchAsync(async (req, res) => {
  const departmentId = getRouteParam(req, 'departmentId');
  const result = await AcademicDepartmentServices.getSingleAcademicDepartment(departmentId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Academic department retrieved successfully',
    data: result,
  });
});

const updateAcademicDepartment = catchAsync(async (req, res) => {
  const departmentId = getRouteParam(req, 'departmentId');
  const result = await AcademicDepartmentServices.updateAcademicDepartment(departmentId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Academic department updated successfully',
    data: result,
  });
});

const deleteAcademicDepartment = catchAsync(async (req, res) => {
  const departmentId = getRouteParam(req, 'departmentId');
  const result = await AcademicDepartmentServices.deleteAcademicDepartment(departmentId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Academic department deleted successfully',
    data: result,
  });
});

export const AcademicDepartmentControllers = {
  createAcademicDepartment,
  getAllAcademicDepartments,
  getSingleAcademicDepartment,
  updateAcademicDepartment,
  deleteAcademicDepartment,
};
