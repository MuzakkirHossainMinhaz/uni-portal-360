import type { RequestHandler } from 'express';
import { unlink } from 'fs/promises';
import AppError from '../errors/AppError';
import { logger } from '../utils/logger';

const parseMultipartData: RequestHandler = (req, res, next) => {
  const path = req.file?.path;
  if (path)
    res.once('finish', () => {
      void unlink(path).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== 'ENOENT') logger.error('Could not clean temporary upload', error);
      });
    });
  try {
    if (typeof req.body?.data !== 'string') throw new Error('Missing form data');
    req.body = JSON.parse(req.body.data);
    next();
  } catch {
    next(new AppError(400, 'Invalid form data'));
  }
};
export default parseMultipartData;
