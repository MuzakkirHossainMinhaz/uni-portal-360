import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { MemberServices } from './member.service';

const getSingleMember = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const result = await MemberServices.getSingleMemberFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Member is retrieved successfully',
    data: result,
  });
});

const getAllMembers = catchAsync(async (req, res) => {
  const result = await MemberServices.getAllMembersFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Members are retrieved successfully',
    meta: result.meta,
    data: result.result,
  });
});

const updateMember = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const member = req.body.member || req.body;
  const result = await MemberServices.updateMemberIntoDB(id, member);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Member is updated successfully',
    data: result,
  });
});

const deleteMember = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const result = await MemberServices.deleteMemberFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Member is deleted successfully',
    data: result,
  });
});

export const MemberControllers = {
  getAllMembers,
  getSingleMember,
  deleteMember,
  updateMember,
};
