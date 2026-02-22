import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';
import { SemesterResultControllers } from './semesterResult.controller';

const router = express.Router();

/**
 * @openapi
 * /semester-results/my-results:
 *   get:
 *     summary: Get my semester results (Student only)
 *     tags: [Semester Results]
 *     responses:
 *       200:
 *         description: Semester results retrieved successfully
 */
router.get(
  '/my-results',
  auth(USER_ROLE.student),
  SemesterResultControllers.getMySemesterResults,
);

export const SemesterResultRoutes = router;

