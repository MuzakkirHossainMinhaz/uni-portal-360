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
  const result = await AssignmentServices.getAllAssignments(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Assignments retrieved successfully',
    data: result,
  });
});

const getAssignmentById = catchAsync(async (req, res) => {
  const idParam = req.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const result = await AssignmentServices.getAssignmentById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Assignment retrieved successfully',
    data: result,
  });
});

const updateAssignment = catchAsync(async (req, res) => {
  const idParam = req.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const result = await AssignmentServices.updateAssignment(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Assignment updated successfully',
    data: result,
  });
});

const deleteAssignment = catchAsync(async (req, res) => {
  const idParam = req.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const result = await AssignmentServices.deleteAssignment(id);

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
