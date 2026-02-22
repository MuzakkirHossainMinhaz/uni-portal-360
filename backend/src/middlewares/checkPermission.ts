import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import AppError from '../errors/AppError';
import { RBACService } from '../modules/RBAC/rbac.service';
import catchAsync from '../utils/catchAsync';

const checkPermission = (permission: string) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user.role;

    if (!userRole) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
    }

    const hasAccess = await RBACService.hasPermission(userRole, permission);

    if (!hasAccess) {
      throw new AppError(httpStatus.FORBIDDEN, 'You do not have permission to perform this action');
    }

    next();
  });
};

export default checkPermission;
