import { getRouteParam } from '../../utils/getRouteParam';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { FeeServices } from './fee.service';

const createFee = catchAsync(async (req, res) => {
  const result = await FeeServices.createFee(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Fee created successfully',
    data: result,
  });
});

const getAllFees = catchAsync(async (req, res) => {
  const result = await FeeServices.getAllFees(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Fees retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getMyFees = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await FeeServices.getMyFees(userId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My fees retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const payFee = catchAsync(async (req, res) => {
  const id = getRouteParam(req, 'id');
  const result = await FeeServices.payFee(id, req.user.userId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Simulated payment recorded', data: result });
});

const getMyFeeSummary = catchAsync(async (req, res) => {
  const result = await FeeServices.getMyFeeSummary(req.user.userId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Fee summary retrieved', data: result });
});

const updateFee = catchAsync(async (req, res) => {
  const result = await FeeServices.updateFee(getRouteParam(req, 'id'), req.body);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Fee updated successfully', data: result });
});

const deleteFee = catchAsync(async (req, res) => {
  const result = await FeeServices.deleteFee(getRouteParam(req, 'id'));
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Fee voided successfully', data: result });
});

export const FeeControllers = {
  createFee,
  getAllFees,
  getMyFees,
  getMyFeeSummary,
  payFee,
  updateFee,
  deleteFee,
};
