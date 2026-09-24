import { Router } from 'express';
import { AcademicDepartmentRoutes } from '../modules/AcademicDepartment/academicDepartment.route';
import { AcademicFacultyRoutes } from '../modules/AcademicFaculty/academicFaculty.route';
import { AcademicSemesterRoutes } from '../modules/AcademicSemester/academicSemester.route';
import { AdminRoutes } from '../modules/Admin/admin.route';
import { AnalyticsRoutes } from '../modules/Analytics/analytics.route';
import { AssignmentRoutes } from '../modules/Assignment/assignment.route';
import { AttendanceRoutes } from '../modules/Attendance/attendance.route';
import { AuditLogRoutes } from '../modules/AuditLog/auditLog.route';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { CourseRoutes } from '../modules/Course/course.route';
import { EnrolledCourseRoutes } from '../modules/EnrolledCourse/enrolledCourse.route';
import { FacultyRoutes } from '../modules/Faculty/faculty.route';
import { FeeRoutes } from '../modules/Fee/fee.route';
import { NotificationRoutes } from '../modules/Notification/notification.route';
import { offeredCourseRoutes } from '../modules/OfferedCourse/OfferedCourse.route';
import { semesterRegistrationRoutes } from '../modules/SemesterRegistration/semesterRegistration.route';
import { SemesterResultRoutes } from '../modules/SemesterResult/semesterResult.route';
import { StudentRoutes } from '../modules/Student/student.route';
import { SubmissionRoutes } from '../modules/Submission/submission.route';
import { TranscriptRoutes } from '../modules/Transcript/transcript.route';
import { UserRoutes } from '../modules/User/user.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/students',
    route: StudentRoutes,
  },
  {
    path: '/faculties',
    route: FacultyRoutes,
  },
  {
    path: '/admins',
    route: AdminRoutes,
  },
  {
    path: '/academic-semesters',
    route: AcademicSemesterRoutes,
  },
  {
    path: '/academic-faculties',
    route: AcademicFacultyRoutes,
  },
  {
    path: '/academic-departments',
    route: AcademicDepartmentRoutes,
  },
  {
    path: '/courses',
    route: CourseRoutes,
  },
  {
    path: '/semester-registrations',
    route: semesterRegistrationRoutes,
  },
  {
    path: '/offered-courses',
    route: offeredCourseRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/enrolled-courses',
    route: EnrolledCourseRoutes,
  },
  {
    path: '/attendance',
    route: AttendanceRoutes,
  },
  {
    path: '/semester-results',
    route: SemesterResultRoutes,
  },
  {
    path: '/transcript',
    route: TranscriptRoutes,
  },
  {
    path: '/assignments',
    route: AssignmentRoutes,
  },
  {
    path: '/submissions',
    route: SubmissionRoutes,
  },
  {
    path: '/notifications',
    route: NotificationRoutes,
  },
  {
    path: '/audit-logs',
    route: AuditLogRoutes,
  },
  {
    path: '/fees',
    route: FeeRoutes,
  },
  {
    path: '/analytics',
    route: AnalyticsRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
