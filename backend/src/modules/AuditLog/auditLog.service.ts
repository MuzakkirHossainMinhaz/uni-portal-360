import { AuditLog } from './auditLog.model';
import { TAuditLog } from './auditLog.interface';
import { logger } from '../../utils/logger';

const createAuditLog = async (payload: Partial<TAuditLog>) => {
  try {
    await AuditLog.create(payload);
  } catch (error) {
    logger.error('Failed to create audit log', error);
  }
};

const getAuditLogs = async (query: Record<string, unknown>) => {
  const { page = 1, limit = 20, userId, entityType, action, startDate, endDate, severity } = query;

  const filter: Record<string, unknown> = {};

  if (userId) filter.userId = userId;
  if (entityType) filter.entityType = entityType;
  if (action) filter.action = { $regex: action, $options: 'i' };
  if (severity) filter.severity = severity;

  if (startDate && endDate) {
    filter.createdAt = {
      $gte: new Date(startDate as string),
      $lte: new Date(endDate as string),
    };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const logs = await AuditLog.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate('userId', 'email role id');

  const total = await AuditLog.countDocuments(filter);

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
    },
    data: logs,
  };
};

export const AuditLogService = {
  createAuditLog,
  getAuditLogs,
};
