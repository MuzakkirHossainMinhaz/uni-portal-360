import type { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config, { validateRuntimeConfig } from './config';
import seedSuperAdmin from './config/db';
import { AuditLogCleanup } from './modules/AuditLog/auditLog.cleanup';
import { RBACServices } from './modules/RBAC/rbac.service';
import { logger } from './utils/logger';

let server: Server;

async function main() {
  try {
    validateRuntimeConfig();
    await mongoose.connect(config.database_url as string);

    await seedSuperAdmin();
    await RBACServices.seedRBAC(); // Seed RBAC roles and permissions

    // Initialize scheduled tasks
    AuditLogCleanup.initAuditLogCleanup();

    server = app.listen(config.port, () => {
      logger.info(`App listening on PORT ${config.port}`);
    });
  } catch (err) {
    logger.error('Error starting application', err);
    process.exitCode = 1;
    await mongoose.disconnect();
  }
}

main();

const shutdown = (signal: string) => {
  logger.info(`Received ${signal}; shutting down`);
  if (server) server.close(() => void mongoose.disconnect().finally(() => process.exit(0)));
  else void mongoose.disconnect().finally(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

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
