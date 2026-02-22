import { AuditLogService } from '../modules/AuditLog/auditLog.service';
import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import sendResponse from '../utils/sendResponse';

const getAuditLogs = catchAsync(async (req, res) => {
  const result = await AuditLogService.getAuditLogs(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Audit logs retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

export const AuditLogController = {
  getAuditLogs,
};
