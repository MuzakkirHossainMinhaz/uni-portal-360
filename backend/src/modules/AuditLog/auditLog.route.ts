import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';
import { AuditLogControllers } from './auditLog.controller';

const router = express.Router();

router.get('/', auth(USER_ROLE.superAdmin, USER_ROLE.admin), AuditLogControllers.getAuditLogs);

export const AuditLogRoutes = router;
