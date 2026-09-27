import type { UploadApiResponse } from 'cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import multer from 'multer';
import config from '../config';
import { logger } from './logger';
import path from 'path';

cloudinary.config({
  cloud_name: config.cloudinary_cloud_name,
  api_key: config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret,
});

export const sendImageToCloudinary = (imageName: string, path: string): Promise<Record<string, unknown>> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(path, { public_id: imageName.trim(), resource_type: 'auto' }, function (error, result) {
      if (error) {
        reject(error);
      } else if (result) resolve(result as UploadApiResponse);
      else reject(new Error('Upload provider did not return a result'));
      // delete a file asynchronously
      fs.unlink(path, (err) => {
        if (err && err.code !== 'ENOENT') {
          logger.error('Error deleting file after upload', err);
        } else {
          logger.info('Temporary upload file deleted');
        }
      });
    });
  });
};

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    const directory = path.join(process.cwd(), 'uploads');
    fs.mkdir(directory, { recursive: true }, (error) => cb(error, directory));
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  },
});

export const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024, files: 1 } });
