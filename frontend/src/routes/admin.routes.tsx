import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
const AcademicDepartment = lazy(() => import('../pages/admin/academicManagement/AcademicDepartment'));
const AcademicFaculty = lazy(() => import('../pages/admin/academicManagement/AcademicFaculty'));
const AcademicSemester = lazy(() => import('../pages/admin/academicManagement/AcademicSemester'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminAttendanceDashboard = lazy(() => import('../pages/admin/attendance/AdminAttendanceDashboard'));
const AuditLogs = lazy(() => import('../pages/admin/auditLog/AuditLogs'));
const Courses = lazy(() => import('../pages/admin/courseManagement/Courses'));
const OfferedCourses = lazy(() => import('../pages/admin/courseManagement/OfferedCourses'));
const Semesters = lazy(() => import('../pages/admin/courseManagement/Semesters'));
const FeeManagement = lazy(() => import('../pages/admin/fee/FeeManagement'));
const AccountsAndRoles = lazy(() => import('../pages/admin/userManagement/AccountsAndRoles'));
const Admin = lazy(() => import('../pages/admin/userManagement/Admin'));
const Faculty = lazy(() => import('../pages/admin/userManagement/Faculty'));
const Student = lazy(() => import('../pages/admin/userManagement/Student'));
const GradeCorrections = lazy(() => import('../pages/admin/GradeCorrections'));
const AssignmentGradeCorrections = lazy(() => import('../pages/admin/AssignmentGradeCorrections'));

export const adminPaths = [
  {
    name: 'Dashboard',
    path: 'dashboard',
    element: <AdminDashboard />,
  },
  {
    name: 'Academic Management',
    children: [
      {
        name: 'Academic Semester',
        path: 'academic-semester',
        element: <AcademicSemester />,
      },
      {
        name: 'Academic Faculty',
        path: 'academic-faculty',
        element: <AcademicFaculty />,
      },
      {
        name: 'Academic Department',
        path: 'academic-department',
        element: <AcademicDepartment />,
      },
    ],
  },
  {
    name: 'User Management',
    children: [
      {
        name: 'All Accounts & Roles',
        path: 'accounts',
        element: <AccountsAndRoles />,
      },
      {
        name: 'Admins',
        path: 'admins',
        element: <Admin />,
      },
      {
        name: 'Faculty',
        path: 'faculty',
        element: <Faculty />,
      },
      {
        name: 'Students',
        path: 'students',
        element: <Student />,
      },
    ],
  },
  {
    name: 'Course Management',
    children: [
      {
        name: 'Semesters',
        path: 'registered-semesters',
        element: <Semesters />,
      },
      {
        name: 'Courses',
        path: 'courses',
        element: <Courses />,
      },
      {
        name: 'Offered Courses',
        path: 'offered-courses',
        element: <OfferedCourses />,
      },
    ],
  },
  { path: 'semester-registration', element: <Navigate to="/admin/registered-semesters" replace /> },
  { path: 'create-course', element: <Navigate to="/admin/courses" replace /> },
  { path: 'offer-course', element: <Navigate to="/admin/offered-courses" replace /> },
  { name: 'Attendance', path: 'attendance', element: <AdminAttendanceDashboard /> },
  { name: 'Grade Corrections', path: 'grade-corrections', element: <GradeCorrections /> },
  { name: 'Assignment Corrections', path: 'assignment-corrections', element: <AssignmentGradeCorrections /> },
  {
    name: 'Fee Management',
    children: [
      {
        name: 'Manage Fees',
        path: 'fees',
        element: <FeeManagement />,
      },
    ],
  },
  {
    name: 'System',
    children: [
      {
        name: 'Audit Logs',
        path: 'audit-logs',
        element: <AuditLogs />,
      },
    ],
  },
];
