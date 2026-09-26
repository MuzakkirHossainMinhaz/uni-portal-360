import { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { logout, TUser, useCurrentToken } from '../../redux/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { verifyToken } from '../../utils/verifyToken';

type TProtectedRoute = {
  children: ReactNode;
  role: string | undefined;
};

const ProtectedRoute = ({ children, role }: TProtectedRoute) => {
  const token = useAppSelector(useCurrentToken);
  const dispatch = useAppDispatch();

  let user: TUser | undefined;
  let hasInvalidSession = false;

  if (token) {
    try {
      user = verifyToken(token) as TUser;
      hasInvalidSession = !user.exp || user.exp * 1000 <= Date.now();
    } catch {
      hasInvalidSession = true;
    }
  }

  const allowedRoles = role?.split('|');
  const hasInvalidRole = Boolean(allowedRoles && !allowedRoles.includes(user?.role || ''));
  const shouldLogout = Boolean(token) && (hasInvalidSession || hasInvalidRole);

  useEffect(() => {
    if (!shouldLogout) {
      return;
    }

    dispatch(logout());

    if (hasInvalidSession) {
      toast.error('Your session has expired. Please log in again.', {
        id: 'session-expired',
      });
    }
  }, [dispatch, hasInvalidSession, shouldLogout]);

  if (!token || shouldLogout) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
