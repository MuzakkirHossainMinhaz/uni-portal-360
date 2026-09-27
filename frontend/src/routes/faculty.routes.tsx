import { lazy } from 'react';
const FacultyDashboard = lazy(() => import('../pages/faculty/FacultyDashboard'));
const MyCourses = lazy(() => import('../pages/faculty/MyCourses'));
const MyStudents = lazy(() => import('../pages/faculty/MyStudents'));
const CreateAssignment = lazy(() => import('../pages/faculty/assignment/CreateAssignment'));
const FacultyAssignments = lazy(() => import('../pages/faculty/assignment/FacultyAssignments'));
const FacultyAttendance = lazy(() => import('../pages/faculty/attendance/FacultyAttendance'));
const FacultyGradebook = lazy(() => import('../pages/faculty/gradebook/FacultyGradebook'));
const FacultySubmissions = lazy(() => import('../pages/faculty/submission/FacultySubmissions'));

export const facultyPaths = [
  {
    name: 'Dashboard',
    path: 'dashboard',
    element: <FacultyDashboard />,
  },
  {
    name: 'My Courses',
    path: 'courses',
    element: <MyCourses />,
  },
  {
    path: 'courses/:registerSemesterId/:courseId',
    element: <MyStudents />,
  },
  {
    name: 'Assignments',
    path: 'assignments',
    element: <FacultyAssignments />,
  },
  {
    path: 'create-assignment',
    element: <CreateAssignment />,
  },
  {
    path: 'submissions/:assignmentId',
    element: <FacultySubmissions />,
  },
  {
    name: 'Gradebook',
    path: 'gradebook',
    element: <FacultyGradebook />,
  },
  {
    name: 'Attendance',
    path: 'attendance',
    element: <FacultyAttendance />,
  },
];
