import express from 'express';
import parseMultipartData from '../../middlewares/parseMultipartData';

import auth from '../../middlewares/auth';
import checkPermission from '../../middlewares/checkPermission';
import validateRequest from '../../middlewares/validateRequest';
import { upload } from '../../utils/sendImageToCloudinary';
import { AdminValidations } from '../Admin/admin.validation';
import { FacultyValidations } from '../Faculty/faculty.validation';
import { StudentValidations } from '../Student/student.validation';
import { USER_ROLE } from './user.constant';
import { UserControllers } from './user.controller';
import { UserValidations } from './user.validation';

const router = express.Router();

// The directory includes bootstrap users without a role-specific profile.
router.get('/', auth(USER_ROLE.superAdmin, USER_ROLE.admin), UserControllers.getAccounts);
router.get('/roles', auth(USER_ROLE.superAdmin, USER_ROLE.admin), UserControllers.getRoles);

router.post(
  '/create-student',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  checkPermission('createStudent'),
  upload.single('file'),
  parseMultipartData,
  validateRequest(StudentValidations.createStudentValidationSchema),
  UserControllers.createStudent,
);

router.post(
  '/create-faculty',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  checkPermission('createFaculty'),
  upload.single('file'),
  parseMultipartData,
  validateRequest(FacultyValidations.createFacultyValidationSchema),
  UserControllers.createFaculty,
);

router.post(
  '/create-admin',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  checkPermission('createAdmin'),
  upload.single('file'),
  parseMultipartData,
  validateRequest(AdminValidations.createAdminValidationSchema),
  UserControllers.createAdmin,
);

router.post(
  '/change-status/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(UserValidations.changeStatusValidationSchema),
  UserControllers.changeStatus,
);

router.get(
  '/me',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.faculty, USER_ROLE.student),
  UserControllers.getMe,
);

export const UserRoutes = router;
