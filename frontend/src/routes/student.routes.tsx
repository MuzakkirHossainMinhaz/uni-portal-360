import { lazy } from 'react';
const MySchedule = lazy(() => import('../pages/student/MySchedule'));
const OfferedCourse = lazy(() => import('../pages/student/OfferedCourse'));
const StudentDashboard = lazy(() => import('../pages/student/StudentDashboard'));
const StudentAssignments = lazy(() => import('../pages/student/assignment/StudentAssignments'));
const StudentAttendance = lazy(() => import('../pages/student/attendance/StudentAttendance'));
const StudentFees = lazy(() => import('../pages/student/fee/StudentFees'));
const StudentResults = lazy(() => import('../pages/student/results/StudentResults'));

export const studentPaths = [
  {
    name: 'Dashboard',
    path: 'dashboard',
    element: <StudentDashboard />,
  },
  {
    name: 'Offered Course',
    path: 'offered-course',
    element: <OfferedCourse />,
  },
  {
    name: 'My Schedule',
    path: 'schedule',
    element: <MySchedule />,
  },
  {
    name: 'Assignments',
    path: 'assignments',
    element: <StudentAssignments />,
  },
  {
    name: 'Results',
    path: 'results',
    element: <StudentResults />,
  },
  {
    name: 'Attendance',
    path: 'attendance',
    element: <StudentAttendance />,
  },
  {
    name: 'Fees',
    path: 'fees',
    element: <StudentFees />,
  },
];
