import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../User/user.constant';
import { AcademicSemesterControllers } from './academicSemester.controller';
import { AcademicSemesterValidations } from './academicSemester.validation';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(AcademicSemesterValidations.createAcdemicSemesterValidationSchema),
  AcademicSemesterControllers.createAcademicSemester,
);

router.get(
  '/',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.faculty, USER_ROLE.student),
  AcademicSemesterControllers.getAllAcademicSemesters,
);

router.get(
  '/:semesterId',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.faculty, USER_ROLE.student),
  AcademicSemesterControllers.getSingleAcademicSemester,
);

router.patch(
  '/:semesterId',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(AcademicSemesterValidations.updateAcademicSemesterValidationSchema),
  AcademicSemesterControllers.updateAcademicSemester,
);

router.delete(
  '/:semesterId',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  AcademicSemesterControllers.deleteAcademicSemester,
);

export const AcademicSemesterRoutes = router;
