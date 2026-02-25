import AcademicDepartment from '../pages/admin/academicManagement/AcademicDepartment';
import AcademicFaculty from '../pages/admin/academicManagement/AcademicFaculty';
import AcademicSemester from '../pages/admin/academicManagement/AcademicSemester';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AuditLogs from '../pages/admin/auditLog/AuditLogs';
import Courses from '../pages/admin/courseManagement/Courses';
import CreateCourse from '../pages/admin/courseManagement/CreateCourse';
import OfferCourse from '../pages/admin/courseManagement/OfferCourse';
import OfferedCourses from '../pages/admin/courseManagement/OfferedCourses';
import RegisteredSemesters from '../pages/admin/courseManagement/RegisteredSemesters';
import SemesterRegistration from '../pages/admin/courseManagement/SemesterRegistration';
import FeeManagement from '../pages/admin/fee/FeeManagement';
import Admin from '../pages/admin/userManagement/Admin';
import Faculty from '../pages/admin/userManagement/Faculty';
import Member from '../pages/admin/userManagement/Member';
import Student from '../pages/admin/userManagement/Student';

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
        name: 'Admins',
        path: 'admins',
        element: <Admin />,
      },
      {
        name: 'Members',
        path: 'members',
        element: <Member />,
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
        name: 'Semester Registration',
        path: 'semester-registration',
        element: <SemesterRegistration />,
      },
      {
        name: 'Registered Semesters',
        path: 'registered-semesters',
        element: <RegisteredSemesters />,
      },
      {
        name: 'Create Course',
        path: 'create-course',
        element: <CreateCourse />,
      },
      {
        name: 'Courses',
        path: 'courses',
        element: <Courses />,
      },
      {
        name: 'Offer Course',
        path: 'offer-course',
        element: <OfferCourse />,
      },
      {
        name: 'Offered Courses',
        path: 'offered-courses',
        element: <OfferedCourses />,
      },
    ],
  },
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

// export const adminSidebarItems = adminPaths.reduce(
//   (acc: TSidebarItem[], item) => {
//     if (item.path && item.name) {
//       acc.push({
//         key: item.name,
//         label: <NavLink to={`/admin/${item.path}`}>{item.name}</NavLink>,
//       });
//     }

//     if (item.children) {
//       acc.push({
//         key: item.name,
//         label: item.name,
//         children: item.children.map((child) => ({
//           key: child.name,
//           label: <NavLink to={`/admin/${child.path}`}>{child.name}</NavLink>,
//         })),
//       });
//     }

//     return acc;
//   },
//   []
// );

//* Programatical way

// export const adminRoutes = adminPaths.reduce((acc: TRoute[], item) => {
//   if (item.path && item.element) {
//     acc.push({
//       path: item.path,
//       element: item.element,
//     });
//   }

//   if (item.children) {
//     item.children.forEach((child) => {
//       acc.push({
//         path: child.path,
//         element: child.element,
//       });
//     });
//   }

//   return acc;
// }, []);

//! Hard coded way

// export const adminPaths = [
//   {
//     path: 'dashboard',
//     element: <AdminDashboard />,
//   },
//   {
//     path: 'create-student',
//     element: <CreateStudent />,
//   },
//   {
//     path: 'create-admin',
//     element: <CreateAdmin />,
//   },
//   {
//     path: 'create-faculty',
//     element: <CreateFaculty />,
//   },
// ];
