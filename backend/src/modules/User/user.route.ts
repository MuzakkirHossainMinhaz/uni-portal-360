import express, { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import auth from '../../middlewares/auth';
import checkPermission from '../../middlewares/checkPermission';
import validateRequest from '../../middlewares/validateRequest';
import { upload } from '../../utils/sendImageToCloudinary';
import { createAdminValidationSchema } from '../Admin/admin.validation';
import { createFacultyValidationSchema } from '../Faculty/faculty.validation';
import { createStudentValidationSchema } from '../Student/student.validation';
import { USER_ROLE } from './user.constant';
import { UserControllers } from './user.controller';
import { UserValidation } from './user.validation';

const router = express.Router();

const parseMultipartData = (req: Request, _res: Response, next: NextFunction) => {
  const rawData = req.body?.data;

  if (typeof rawData !== 'string') {
    return next(new AppError(httpStatus.BAD_REQUEST, 'Invalid form data'));
  }

  try {
    req.body = JSON.parse(rawData);
    next();
  } catch {
    next(new AppError(httpStatus.BAD_REQUEST, 'Invalid form data'));
  }
};

// The directory includes bootstrap users without a role-specific profile.
router.get('/', auth(USER_ROLE.superAdmin, USER_ROLE.admin), UserControllers.getAccounts);
router.get('/roles', auth(USER_ROLE.superAdmin, USER_ROLE.admin), UserControllers.getRoles);

router.post(
  '/create-student',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  checkPermission('createStudent'),
  upload.single('file'),
  parseMultipartData,
  validateRequest(createStudentValidationSchema),
  UserControllers.createStudent,
);

router.post(
  '/create-faculty',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  checkPermission('createFaculty'),
  upload.single('file'),
  parseMultipartData,
  validateRequest(createFacultyValidationSchema),
  UserControllers.createFaculty,
);

router.post(
  '/create-admin',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  checkPermission('createAdmin'),
  upload.single('file'),
  parseMultipartData,
  validateRequest(createAdminValidationSchema),
  UserControllers.createAdmin,
);

router.post(
  '/change-status/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(UserValidation.changeStatusValidationSchema),
  UserControllers.changeStatus,
);

router.get(
  '/me',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.faculty, USER_ROLE.student),
  UserControllers.getMe,
);

export const UserRoutes = router;
