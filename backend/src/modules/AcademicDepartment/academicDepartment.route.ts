import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../User/user.constant';
import { AcademicDepartmentControllers } from './academicDepartment.controller';
import { AcademicDepartmentValidation } from './academicDepartment.validation';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(AcademicDepartmentValidation.createAcademicDepartmentValidationSchema),
  AcademicDepartmentControllers.createAcademicDepartment,
);

router.get(
  '/',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.faculty, USER_ROLE.student),
  AcademicDepartmentControllers.getAllAcademicDepartments,
);

router.get(
  '/:departmentId',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.faculty, USER_ROLE.student),
  AcademicDepartmentControllers.getSingleAcademicDepartment,
);

router.patch(
  '/:departmentId',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(AcademicDepartmentValidation.updateAcademicDepartmentValidationSchema),
  AcademicDepartmentControllers.updateAcademicDepartment,
);

router.delete(
  '/:departmentId',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  AcademicDepartmentControllers.deleteAcademicDepartment,
);

export const AcademicDepartmentRoutes = router;
