import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../User/user.constant';
import { AcademicFacultyControllers } from './academicFaculty.controller';
import { AcademicFacultyValidation } from './academicFaculty.validation';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(AcademicFacultyValidation.createAcademicFacultyValidationSchema),
  AcademicFacultyControllers.createAcademicFaculty,
);

router.get(
  '/',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.faculty, USER_ROLE.student),
  AcademicFacultyControllers.getAllAcademicFaculties,
);

router.get(
  '/:facultyId',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.faculty, USER_ROLE.student),
  AcademicFacultyControllers.getSingleAcademicFaculty,
);

router.patch(
  '/:facultyId',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(AcademicFacultyValidation.updateAcademicFacultyValidationSchema),
  AcademicFacultyControllers.updateAcademicFaculty,
);

router.delete(
  '/:facultyId',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  AcademicFacultyControllers.deleteAcademicFaculty,
);

export const AcademicFacultyRoutes = router;
