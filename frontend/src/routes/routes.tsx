import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import ChangePassword from '../pages/ChangePassword';
import Login from '../pages/Login';
import ResetPassword from '../pages/ResetPassword';
import Notifications from '../pages/Notifications';
import Profile from '../pages/Profile';
import { routeGenerator } from '../utils/routesGenerator';
import { adminPaths } from './admin.routes';
import { facultyPaths } from './faculty.routes';
import { studentPaths } from './student.routes';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute role="admin|superAdmin">
        <App />
      </ProtectedRoute>
    ),
    children: routeGenerator(adminPaths),
  },
  {
    path: '/faculty',
    element: (
      <ProtectedRoute role="faculty">
        <App />
      </ProtectedRoute>
    ),
    children: routeGenerator(facultyPaths),
  },
  {
    path: '/student',
    element: (
      <ProtectedRoute role="student">
        <App />
      </ProtectedRoute>
    ),
    children: routeGenerator(studentPaths),
  },
  {
    path: '/login',
    element: <Login />,
  },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '/notifications', element: <App />, children: [{ index: true, element: <Notifications /> }] },
  { path: '/profile', element: <App />, children: [{ index: true, element: <Profile /> }] },
  {
    path: '/change-password',
    element: (
      <ProtectedRoute role={undefined} allowPasswordChange>
        <ChangePassword />
      </ProtectedRoute>
    ),
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export default router;
