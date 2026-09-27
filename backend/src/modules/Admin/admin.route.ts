import express from 'express';
import auth from '../../middlewares/auth';
import checkPermission from '../../middlewares/checkPermission';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../User/user.constant';
import { AdminControllers } from './admin.controller';
import { AdminValidations } from './admin.validation';

const router = express.Router();

router.get('/', auth(USER_ROLE.superAdmin, USER_ROLE.admin), AdminControllers.getAllAdmins);

router.get('/:id', auth(USER_ROLE.superAdmin, USER_ROLE.admin), AdminControllers.getSingleAdmin);

router.patch(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  checkPermission('updateAdmin'),
  validateRequest(AdminValidations.updateAdminValidationSchema),
  AdminControllers.updateAdmin,
);

router.delete(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  checkPermission('deleteAdmin'),
  AdminControllers.deleteAdmin,
);

export const AdminRoutes = router;
