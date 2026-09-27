import { getRouteParam } from '../../utils/getRouteParam';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AssignmentServices } from './assignment.service';

const createAssignment = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await AssignmentServices.createAssignment(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Assignment created successfully',
    data: result,
  });
});

const getAllAssignments = catchAsync(async (req, res) => {
  const result = await AssignmentServices.getAllAssignments(req.query, {
    userId: req.user.userId,
    role: req.user.role,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Assignments retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getAssignmentById = catchAsync(async (req, res) => {
  const id = getRouteParam(req, 'id');
  const result = await AssignmentServices.getAssignmentById(id, { userId: req.user.userId, role: req.user.role });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Assignment retrieved successfully',
    data: result,
  });
});

const updateAssignment = catchAsync(async (req, res) => {
  const id = getRouteParam(req, 'id');
  const result = await AssignmentServices.updateAssignment(id, req.body, {
    userId: req.user.userId,
    role: req.user.role,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Assignment updated successfully',
    data: result,
  });
});

const deleteAssignment = catchAsync(async (req, res) => {
  const id = getRouteParam(req, 'id');
  const result = await AssignmentServices.deleteAssignment(id, { userId: req.user.userId, role: req.user.role });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Assignment deleted successfully',
    data: result,
  });
});

export const AssignmentControllers = {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
};
