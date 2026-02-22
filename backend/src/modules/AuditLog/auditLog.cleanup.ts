import cron from 'node-cron';
import { AuditLog } from './auditLog.model';

// Schedule task to run every day at midnight (00:00)
const initAuditLogCleanup = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Running audit log cleanup...');
    try {
      // Retention policy: Keep logs for 90 days
      const retentionPeriod = 90;
      const retentionDate = new Date();
      retentionDate.setDate(retentionDate.getDate() - retentionPeriod);

      const result = await AuditLog.deleteMany({
        createdAt: { $lt: retentionDate },
      });

      console.log(`Audit log cleanup complete. Deleted ${result.deletedCount} logs older than ${retentionDate.toISOString()}`);
    } catch (error) {
      console.error('Error during audit log cleanup:', error);
    }
  });
};

export const AuditLogCleanup = {
  initAuditLogCleanup,
};
