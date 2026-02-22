import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SemesterResultServices } from './semesterResult.service';

const getMySemesterResults = catchAsync(async (req, res) => {
  const { userId } = req.user; // Student ID
  const result = await SemesterResultServices.getMySemesterResults(userId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Semester results retrieved successfully',
    data: result,
  });
});

export const SemesterResultControllers = {
  getMySemesterResults,
};
