import { logger } from '../utils/logger';
import { USER_ROLE } from '../modules/User/user.constant';
import { User } from '../modules/User/user.model';
import { passwordSchema } from '../utils/passwordPolicy';
import bcrypt from 'bcrypt';
import config from './index';

const seedSuperAdmin = async () => {
  const isSuperAdminExists = await User.findOne({ role: USER_ROLE.superAdmin });

  if (!isSuperAdminExists) {
    const bootstrapPassword = passwordSchema.parse(process.env.BOOTSTRAP_SUPER_ADMIN_PASSWORD);
    const hashed = await bcrypt.hash(bootstrapPassword, config.bcrypt_salt_rounds);
    try {
      const result = await User.updateOne(
        { id: 'SA-0001' },
        {
          $setOnInsert: {
            id: 'SA-0001',
            email: process.env.BOOTSTRAP_SUPER_ADMIN_EMAIL || 'superadmin@uni-portal-360.com',
            password: hashed,
            needsPasswordChange: true,
            role: USER_ROLE.superAdmin,
            status: 'in-progress',
            isDeleted: false,
          },
        },
        { upsert: true },
      );
      if (result.upsertedCount) logger.info('Super Admin created with mandatory first-login password change');
    } catch (error) {
      if (!(error instanceof Error && 'code' in error && error.code === 11000)) throw error;
    }
    if (!(await User.exists({ role: USER_ROLE.superAdmin }))) {
      throw new Error('Super Admin bootstrap ID or email is already in use');
    }
  }
};

export default seedSuperAdmin;
