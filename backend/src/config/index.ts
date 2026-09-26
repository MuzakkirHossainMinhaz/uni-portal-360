import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join((process.cwd(), '.env')) });

const bcryptSaltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

if (!Number.isInteger(bcryptSaltRounds) || bcryptSaltRounds < 4 || bcryptSaltRounds > 15) {
  throw new Error('BCRYPT_SALT_ROUNDS must be an integer between 4 and 15');
}

export default {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT,
  cors_origin: process.env.CORS_ORIGIN,
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_rounds: bcryptSaltRounds,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  reset_pass_ui_link: process.env.RESET_PASS_UI_LINK,
  default_password: process.env.DEFAULT_PASSWORD || 'defaultPassword123',
  smtp_host: process.env.SMTP_HOST,
  smtp_port: process.env.SMTP_PORT,
  smtp_user: process.env.SMTP_USER,
  smtp_pass: process.env.SMTP_PASS,
  smtp_from: process.env.SMTP_FROM,
};
