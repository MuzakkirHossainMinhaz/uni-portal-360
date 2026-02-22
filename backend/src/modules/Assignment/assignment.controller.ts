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
  const { id } = req.params;
  const result = await AssignmentServices.getAssignmentById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Assignment retrieved successfully',
    data: result,
  });
});

export const AssignmentControllers = {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
};
