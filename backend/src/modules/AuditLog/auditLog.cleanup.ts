import cron from 'node-cron';
import { AuditLog } from './auditLog.model';
import { logger } from '../../utils/logger';

// Schedule task to run every day at midnight (00:00)
const initAuditLogCleanup = () => {
  const configuredDays = process.env.AUDIT_RETENTION_DAYS;
  if (!configuredDays) {
    logger.info('Automatic audit-log deletion is disabled');
    return;
  }
  const retentionPeriod = Number(configuredDays);
  if (!Number.isInteger(retentionPeriod) || retentionPeriod < 2555) {
    throw new Error('AUDIT_RETENTION_DAYS must be at least 2555 days');
  }
  cron.schedule('0 0 * * *', async () => {
    logger.info('Running audit log cleanup');
    try {
      const retentionDate = new Date();
      retentionDate.setDate(retentionDate.getDate() - retentionPeriod);

      const result = await AuditLog.deleteMany({
        createdAt: { $lt: retentionDate },
      });

      logger.info(
        `Audit log cleanup complete. Deleted ${result.deletedCount} logs older than ${retentionDate.toISOString()}`,
      );
    } catch (error) {
      logger.error('Error during audit log cleanup', error);
    }
  });
};

export const AuditLogCleanup = {
  initAuditLogCleanup,
};
