export type TAuditLogUser = {
  _id: string;
  email: string;
  id?: string;
  role?: string;
};

export type TAuditLog = {
  _id: string;
  userId: TAuditLogUser | string;
  action: string;
  entityType: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'SUCCESS' | 'FAILURE';
  createdAt: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};
