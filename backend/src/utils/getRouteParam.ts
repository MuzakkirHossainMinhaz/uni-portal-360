import type { Request } from 'express';
import httpStatus from 'http-status';
import AppError from '../errors/AppError';

export const getRouteParam = (req: Request, name: string): string => {
  const value = req.params[name];
  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError(httpStatus.BAD_REQUEST, `Invalid route parameter: ${name}`);
  }
  return value;
};
