import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import seedSuperAdmin from './db';
import config from './config';
import { RBACService } from './modules/RBAC/rbac.service';
import { AuditLogCleanup } from './modules/AuditLog/auditLog.cleanup';
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
      logger.info(`app is listening on port ${config.port}`);
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
