import type { RequestHandler } from 'express';
import { unlink } from 'fs/promises';
import { logger } from '../utils/logger';

// Multer writes before service authorization. Clean the file on rejection or disconnect.
const cleanupUploadedFile: RequestHandler = (req, res, next) => {
  if (req.file?.path) {
    const filePath = req.file.path;
    const cleanup = () => {
      void unlink(filePath).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== 'ENOENT') logger.error('Could not clean temporary upload', error);
      });
    };
    res.once('finish', cleanup);
    res.once('close', cleanup);
  }
  next();
};

export default cleanupUploadedFile;
