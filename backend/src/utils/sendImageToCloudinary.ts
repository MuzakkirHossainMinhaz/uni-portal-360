import type { UploadApiResponse } from 'cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import multer from 'multer';
import config from '../config';
import { logger } from './logger';
import path from 'path';
import { randomUUID } from 'crypto';
import AppError from '../errors/AppError';

cloudinary.config({
  cloud_name: config.cloudinary_cloud_name,
  api_key: config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret,
});

export const sendImageToCloudinary = async (imageName: string, filePath: string): Promise<Record<string, unknown>> => {
  try {
    const header = Buffer.alloc(12);
    const descriptor = await fs.promises.open(filePath, 'r');
    try {
      await descriptor.read(header, 0, 12, 0);
    } finally {
      await descriptor.close();
    }
    const png = header.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const jpeg = header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
    const webp = header.subarray(0, 4).toString() === 'RIFF' && header.subarray(8, 12).toString() === 'WEBP';
    if (!png && !jpeg && !webp) throw new AppError(400, 'Profile photo must be a PNG, JPEG, or WebP image');
    return (await cloudinary.uploader.upload(filePath, {
      public_id: imageName.trim(),
      resource_type: 'image',
      overwrite: false,
    })) as UploadApiResponse;
  } finally {
    await fs.promises.unlink(filePath).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') logger.error('Could not remove temporary profile photo', error);
    });
  }
};

export const sendPrivateSubmission = async (file: Express.Multer.File): Promise<string> => {
  const header = Buffer.alloc(8);
  const descriptor = await fs.promises.open(file.path, 'r');
  try {
    await descriptor.read(header, 0, 8, 0);
  } finally {
    await descriptor.close();
  }
  const pdf = header.subarray(0, 5).toString() === '%PDF-';
  const png = header.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const jpeg = header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
  if (!pdf && !png && !jpeg) {
    await fs.promises.unlink(file.path);
    throw new AppError(400, 'Upload a PDF, PNG, or JPEG file');
  }
  const extension = pdf ? 'pdf' : png ? 'png' : 'jpg';
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      public_id: `submissions/${randomUUID()}.${extension}`,
      resource_type: 'raw',
      type: 'authenticated',
      overwrite: false,
    });
    return `cld:raw:${result.public_id}`;
  } finally {
    await fs.promises.unlink(file.path).catch((error) => logger.error('Could not remove temporary submission', error));
  }
};

export const submissionDownloadUrl = (reference: string) => {
  if (!reference.startsWith('cld:raw:')) return reference;
  return cloudinary.utils.private_download_url(reference.slice('cld:raw:'.length), '', {
    resource_type: 'raw',
    type: 'authenticated',
    expires_at: Math.floor(Date.now() / 1000) + 300,
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
