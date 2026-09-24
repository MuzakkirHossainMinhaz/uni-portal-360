import { logger } from '../utils/logger';
import { USER_ROLE } from '../modules/User/user.constant';
import { User } from '../modules/User/user.model';

const superUser = {
  id: 'SA-0001',
  email: 'superadmin@uni-portal-360.com',
  password: '123456',
  needsPasswordChange: false,
  role: USER_ROLE.superAdmin,
  status: 'active',
  isDeleted: false,
};

const seedSuperAdmin = async () => {
  const isSuperAdminExists = await User.findOne({ role: USER_ROLE.superAdmin });

  if (!isSuperAdminExists) {
    await User.create(superUser);
    logger.info('SuperAdmin seeded (id: SA-0001, email: superadmin@uni-portal-360.com)');
  }
};

export default seedSuperAdmin;
