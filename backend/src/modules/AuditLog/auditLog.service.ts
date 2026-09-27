import { getPagination } from '../../utils/pagination';
import { AuditLog } from './auditLog.model';
import type { TAuditLog } from './auditLog.interface';
import { logger } from '../../utils/logger';

const createAuditLog = async (payload: Partial<TAuditLog>) => {
  try {
    await AuditLog.create(payload);
  } catch (error) {
    logger.error('Failed to create audit log', error);
  }
};

const getAuditLogs = async (query: Record<string, unknown>) => {
  const { userId, entityType, action, startDate, endDate, severity, status } = query;
  const { page, limit, skip } = getPagination(query, 20);

  const filter: Record<string, unknown> = {};

  if (userId) filter.userId = userId;
  if (entityType) filter.entityType = entityType;
  if (action)
    filter.action = {
      $regex: String(action)
        .slice(0, 100)
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      $options: 'i',
    };
  if (severity) filter.severity = severity;
  if (status) filter.status = status;

  const dateFilter: Record<string, Date> = {};
  if (startDate) {
    const start = new Date(String(startDate));
    if (!Number.isNaN(start.getTime())) dateFilter.$gte = start;
  }
  if (endDate) {
    const end = new Date(String(endDate));
    if (!Number.isNaN(end.getTime())) {
      end.setUTCDate(end.getUTCDate() + 1);
      dateFilter.$lt = end;
    }
  }
  if (Object.keys(dateFilter).length) filter.createdAt = dateFilter;

  const logs = await AuditLog.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'email role id');

  const total = await AuditLog.countDocuments(filter);
  const totalPages = Math.ceil(total / limit) || 1;
  const hasNext = page < totalPages;

  return {
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext,
    },
    data: logs,
  };
};

export const AuditLogServices = {
  createAuditLog,
  getAuditLogs,
};
