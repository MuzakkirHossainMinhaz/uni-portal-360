import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SubmissionServices } from './submission.service';

const createSubmission = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await SubmissionServices.createSubmission(userId, req.file, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Assignment submitted successfully',
    data: result,
  });
});

const getAllSubmissions = catchAsync(async (req, res) => {
  const result = await SubmissionServices.getAllSubmissions(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Submissions retrieved successfully',
    data: result,
  });
});

const gradeSubmission = catchAsync(async (req, res) => {
  const idParam = req.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const result = await SubmissionServices.gradeSubmission(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Submission graded successfully',
    data: result,
  });
});

const updateSubmission = catchAsync(async (req, res) => {
  const idParam = req.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const result = await SubmissionServices.updateSubmission(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Submission updated successfully',
    data: result,
  });
});

export const SubmissionControllers = {
  createSubmission,
  getAllSubmissions,
  gradeSubmission,
  updateSubmission,
};
