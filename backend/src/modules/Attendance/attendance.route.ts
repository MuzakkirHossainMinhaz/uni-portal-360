import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../User/user.constant';
import { AttendanceControllers } from './attendance.controller';
import { AttendanceValidation } from './attendance.validation';

const router = express.Router();

/**
 * @openapi
 * /attendance:
 *   post:
 *     summary: Mark attendance (Faculty only)
 *     tags: [Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               offeredCourse:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               attendanceList:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     student:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [Present, Absent, Late]
 *                     remark:
 *                       type: string
 *     responses:
 *       201:
 *         description: Attendance marked successfully
 */
router.post(
  '/',
  auth(USER_ROLE.faculty),
  validateRequest(AttendanceValidation.createAttendanceValidationSchema),
  AttendanceControllers.createAttendance,
);

/**
 * @openapi
 * /attendance/my-attendance:
 *   get:
 *     summary: Get my attendance (Student only)
 *     tags: [Attendance]
 *     responses:
 *       200:
 *         description: Attendance records retrieved
 */
router.get(
  '/my-attendance',
  auth(USER_ROLE.student),
  AttendanceControllers.getMyAttendance,
);

/**
 * @openapi
 * /attendance/admin/report:
 *   get:
 *     summary: Get attendance report (Admin only)
 *     tags: [Attendance]
 *     responses:
 *       200:
 *         description: Report retrieved
 */
router.get(
  '/admin/report',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  AttendanceControllers.getAttendanceReport,
);

/**
 * @openapi
 * /attendance/admin/low-attendance:
 *   get:
 *     summary: Get low attendance students (Admin only)
 *     tags: [Attendance]
 *     parameters:
 *       - in: query
 *         name: threshold
 *         schema:
 *           type: integer
 *         description: Attendance percentage threshold
 *     responses:
 *       200:
 *         description: Low attendance list retrieved
 */
router.get(
  '/admin/low-attendance',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  AttendanceControllers.getLowAttendanceStudents,
);

/**
 * @openapi
 * /attendance/admin/analytics:
 *   get:
 *     summary: Get attendance analytics (Admin only)
 *     tags: [Attendance]
 *     responses:
 *       200:
 *         description: Analytics retrieved
 */
router.get(
  '/admin/analytics',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  AttendanceControllers.getAttendanceAnalytics,
);

export const AttendanceRoutes = router;

