import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';

import { USER_ROLE } from '../User/user.constant';
import { EnrolledCourseControllers } from './enrolledCourse.controller';
import { EnrolledCourseValidations } from './enrolledCourse.validaton';

const router = express.Router();

router.post(
  '/create-enrolled-course',
  auth(USER_ROLE.student),
  validateRequest(EnrolledCourseValidations.createEnrolledCourseValidationZodSchema),
  EnrolledCourseControllers.createEnrolledCourse,
);

router.get('/', auth(USER_ROLE.faculty), EnrolledCourseControllers.getAllEnrolledCourses);

router.get('/my-enrolled-courses', auth(USER_ROLE.student), EnrolledCourseControllers.getMyEnrolledCourses);

/**
 * @openapi
 * /enrolled-courses/update-enrolled-course-marks:
 *   patch:
 *     summary: Update marks for an enrolled course
 *     tags: [Enrolled Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               semesterRegistration:
 *                 type: string
 *               offeredCourse:
 *                 type: string
 *               student:
 *                 type: string
 *               courseMarks:
 *                 type: object
 *                 properties:
 *                   classTest1:
 *                     type: number
 *                   midTerm:
 *                     type: number
 *                   classTest2:
 *                     type: number
 *                   finalTerm:
 *                     type: number
 *     responses:
 *       200:
 *         description: Marks updated successfully
 */
router.patch(
  '/update-enrolled-course-marks',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.faculty),
  validateRequest(EnrolledCourseValidations.updateEnrolledCourseMarksValidationZodSchema),
  EnrolledCourseControllers.updateEnrolledCourseMarks,
);

export const EnrolledCourseRoutes = router;
