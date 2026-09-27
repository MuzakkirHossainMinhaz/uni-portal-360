import express from 'express';
import parseMultipartData from '../../middlewares/parseMultipartData';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { upload } from '../../utils/sendImageToCloudinary';
import { USER_ROLE } from '../User/user.constant';
import { SubmissionControllers } from './submission.controller';
import { SubmissionValidations } from './submission.validation';

const router = express.Router();

router.post(
  '/submit',
  auth(USER_ROLE.student),
  upload.single('file'),
  parseMultipartData,
  validateRequest(SubmissionValidations.createSubmissionValidationSchema),
  SubmissionControllers.createSubmission,
);

router.get(
  '/',
  auth(USER_ROLE.faculty, USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.student),
  SubmissionControllers.getAllSubmissions,
);

router.patch(
  '/:id/grade',
  auth(USER_ROLE.faculty),
  validateRequest(SubmissionValidations.updateSubmissionGradeValidationSchema),
  SubmissionControllers.gradeSubmission,
);

router.patch(
  '/:id',
  auth(USER_ROLE.student),
  validateRequest(SubmissionValidations.updateSubmissionValidationSchema),
  SubmissionControllers.updateSubmission,
);

export const SubmissionRoutes = router;
