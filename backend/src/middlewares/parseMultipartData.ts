import type { RequestHandler } from 'express';
import AppError from '../errors/AppError';

const parseMultipartData: RequestHandler = (req, _res, next) => {
  try {
    if (typeof req.body?.data !== 'string') throw new Error('Missing form data');
    req.body = JSON.parse(req.body.data);
    next();
  } catch {
    next(new AppError(400, 'Invalid form data'));
  }
};
export default parseMultipartData;
