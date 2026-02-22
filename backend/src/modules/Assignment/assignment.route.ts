import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../User/user.constant';
import { AssignmentControllers } from './assignment.controller';
import { AssignmentValidations } from './assignment.validation';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLE.faculty),
  validateRequest(AssignmentValidations.createAssignmentValidationSchema),
  AssignmentControllers.createAssignment,
);

router.get(
  '/',
  auth(USER_ROLE.faculty, USER_ROLE.student, USER_ROLE.admin),
  AssignmentControllers.getAllAssignments,
);

router.get(
  '/:id',
  auth(USER_ROLE.faculty, USER_ROLE.student, USER_ROLE.admin),
  AssignmentControllers.getAssignmentById,
);

export const AssignmentRoutes = router;
