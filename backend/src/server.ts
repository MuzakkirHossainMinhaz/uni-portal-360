import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './config';
import seedSuperAdmin from './config/db';
import { AuditLogCleanup } from './modules/AuditLog/auditLog.cleanup';
import { RBACService } from './modules/RBAC/rbac.service';
import { logger } from './utils/logger';

let server: Server;

async function main() {
  try {
    await mongoose.connect(config.database_url as string);

    await seedSuperAdmin();
    await RBACService.seedRBAC(); // Seed RBAC roles and permissions

    // Initialize scheduled tasks
    AuditLogCleanup.initAuditLogCleanup();

    server = app.listen(config.port, () => {
      logger.info(`App listening on PORT ${config.port}`);
    });
  } catch (err) {
    logger.error('Error starting application', err);
  }
}

main();

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection detected, shutting down', err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception detected, shutting down', err);
  process.exit(1);
});
