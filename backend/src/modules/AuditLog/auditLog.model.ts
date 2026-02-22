import { Schema, model } from 'mongoose';
import { TAuditLog } from './auditLog.interface';

const auditLogSchema = new Schema<TAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      required: true,
      index: true,
    },
    entityId: {
      type: String,
      index: true,
    },
    oldValues: {
      type: Object,
    },
    newValues: {
      type: Object,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW',
      index: true,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE'],
      default: 'SUCCESS',
    },
    metadata: {
      type: Object,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
    collection: 'audit_logs',
  },
);

// Indexes for common query patterns
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ action: 1 });

export const AuditLog = model<TAuditLog>('AuditLog', auditLogSchema);
