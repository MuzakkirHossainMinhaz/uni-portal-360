import { Types } from 'mongoose';

export type TAuditLog = {
  userId: Types.ObjectId;
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'SUCCESS' | 'FAILURE';
  metadata?: Record<string, any>;
};
