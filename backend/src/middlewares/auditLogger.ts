import type { NextFunction, Request, Response } from 'express';
import { AuditLogServices } from '../modules/AuditLog/auditLog.service';
import { User } from '../modules/User/user.model';
import { logger } from '../utils/logger';

const actions: Record<string, string> = { POST: 'CREATE', PUT: 'UPDATE', PATCH: 'UPDATE', DELETE: 'DELETE' };

// Attach before API routes so the finish handler can observe the authenticated user.
export const auditLogger = (req: Request, res: Response, next: NextFunction) => {
  if (!actions[req.method]) return next();

  res.on('finish', () => {
    if (!req.user?.userId) return;
    void (async () => {
      const user = await User.findOne({ id: req.user.userId }).select('_id');
      if (!user) return;

      const path = req.originalUrl.split('?')[0];
      const entityType = path.split('/')[3] || 'system';
      const entityId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const action = path.endsWith('/pay') ? 'PAY' : actions[req.method];
      await AuditLogServices.createAuditLog({
        userId: user._id,
        action,
        entityType,
        entityId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        severity: req.method === 'DELETE' || res.statusCode >= 400 ? 'MEDIUM' : 'LOW',
        status: res.statusCode >= 400 ? 'FAILURE' : 'SUCCESS',
        metadata: { method: req.method, path, statusCode: res.statusCode },
      });
    })().catch((error) => logger.error('Failed to record audit event', error));
  });
  next();
};
