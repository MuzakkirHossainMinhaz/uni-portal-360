import { NextFunction, Request, Response } from 'express';
import { AuditLogService } from '../modules/AuditLog/auditLog.service';
import { TAuditLog } from '../modules/AuditLog/auditLog.interface';
import { Types } from 'mongoose';
import { logger } from '../utils/logger';

export const auditLogger = (action: string, entityType: string, severity: TAuditLog['severity'] = 'LOW') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Intercept response to get ID or success status
    // Note: This simple interception has limitations with streams, but works for JSON APIs.
    
    // We can't easily hook into res.send in a way that guarantees we get the body before finish 
    // without potentially breaking streams or other middleware if not careful.
    // Instead, we will log on 'finish' and do our best to extract ID from params or req body.

    res.on('finish', () => {
        // Only log if user is authenticated
        if (req.user && req.user.userId) {
            const rawEntityId = req.params.id;
            const entityId = Array.isArray(rawEntityId) ? rawEntityId[0] : rawEntityId;

            const logData: Partial<TAuditLog> = {
                userId: new Types.ObjectId(req.user.userId),
                action,
                entityType,
                entityId,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                severity,
                status: res.statusCode >= 400 ? 'FAILURE' : 'SUCCESS',
                metadata: {
                    method: req.method,
                    url: req.originalUrl,
                    statusCode: res.statusCode,
                },
            };

            // Capture Request Body for Create/Update actions (exclude sensitive fields)
            if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
                const safeBody = { ...req.body };
                delete safeBody.password;
                logData.newValues = safeBody;
            }

            AuditLogService.createAuditLog(logData).catch((error) => {
              logger.error('Failed to create audit log from middleware', error);
            });
        }
    });

    next();
  };
};
