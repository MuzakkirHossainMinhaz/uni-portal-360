import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env'), quiet: true });

const bcryptSaltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

if (!Number.isInteger(bcryptSaltRounds) || bcryptSaltRounds < 4 || bcryptSaltRounds > 15) {
  throw new Error('BCRYPT_SALT_ROUNDS must be an integer between 4 and 15');
}

export const validateRuntimeConfig = () => {
  const required = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const;
  for (const key of required) {
    if (!process.env[key] || process.env[key]?.startsWith('your_')) throw new Error(`${key} must be configured`);
  }
  if (process.env.NODE_ENV?.toLowerCase() === 'production') {
    if (!process.env.CORS_ORIGIN || !/^https:\/\//.test(process.env.CORS_ORIGIN)) {
      throw new Error('CORS_ORIGIN must be an HTTPS origin in production');
    }
    if (required.slice(1).some((key) => (process.env[key]?.length ?? 0) < 32)) {
      throw new Error('JWT secrets must contain at least 32 characters in production');
    }
    for (const key of [
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET',
      'SMTP_HOST',
      'SMTP_USER',
      'SMTP_PASS',
      'SMTP_FROM',
      'RESET_PASS_UI_LINK',
    ]) {
      if (!process.env[key] || process.env[key]?.startsWith('your_'))
        throw new Error(`${key} must be configured in production`);
    }
    if (!/^https:\/\//.test(process.env.RESET_PASS_UI_LINK ?? '')) {
      throw new Error('RESET_PASS_UI_LINK must be HTTPS in production');
    }
  }
  const port = Number(process.env.PORT ?? 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be a valid TCP port');
};

export default {
  NODE_ENV: process.env.NODE_ENV,
  port: Number(process.env.PORT ?? 3001),
  cors_origin: process.env.CORS_ORIGIN,
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_rounds: bcryptSaltRounds,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  reset_pass_ui_link: process.env.RESET_PASS_UI_LINK,
  smtp_host: process.env.SMTP_HOST,
  smtp_port: process.env.SMTP_PORT,
  smtp_user: process.env.SMTP_USER,
  smtp_pass: process.env.SMTP_PASS,
  smtp_from: process.env.SMTP_FROM,
};
