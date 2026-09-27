import { AuditLogServices } from './auditLog.service';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import type { Request, Response } from 'express';

const getAuditLogs = catchAsync(async (req: Request, res: Response) => {
  const result = await AuditLogServices.getAuditLogs(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Audit logs retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

export const AuditLogControllers = {
  getAuditLogs,
};
