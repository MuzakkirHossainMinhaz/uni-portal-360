import { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { logout, selectCurrentUser, setPermissions, TUser, useCurrentToken } from '../../redux/features/auth/authSlice';
import { useGetMyPermissionsQuery } from '../../redux/features/auth/authApi';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { verifyToken } from '../../utils/verifyToken';

type TProtectedRoute = {
  children: ReactNode;
  role: string | undefined;
  allowPasswordChange?: boolean;
};

const ProtectedRoute = ({ children, role, allowPasswordChange = false }: TProtectedRoute) => {
  const token = useAppSelector(useCurrentToken);
  const currentUser = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();

  let user: TUser | undefined;
  let hasInvalidSession = false;

  if (token) {
    try {
      user = verifyToken(token) as TUser;
      hasInvalidSession = !user.exp || !user.role || !user.userId || user.exp * 1000 <= Date.now();
    } catch {
      hasInvalidSession = true;
    }
  }

  const allowedRoles = role?.split('|');
  const hasInvalidRole = Boolean(allowedRoles && !allowedRoles.includes(user?.role || ''));
  const shouldLogout = Boolean(token) && (hasInvalidSession || !currentUser);
  const shouldLoadPermissions = Boolean(token && !shouldLogout && !currentUser?.needsPasswordChange && !currentUser?.permissions);
  const { data: permissions } = useGetMyPermissionsQuery(undefined, { skip: !shouldLoadPermissions });

  useEffect(() => {
    if (permissions && shouldLoadPermissions) dispatch(setPermissions(permissions));
  }, [dispatch, permissions, shouldLoadPermissions]);

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

  if (currentUser?.needsPasswordChange && !allowPasswordChange) {
    return <Navigate to="/change-password" replace />;
  }

  if (hasInvalidRole) {
    return <Navigate to={user?.role === 'superAdmin' ? '/admin/dashboard' : `/${user?.role}/dashboard`} replace />;
  }

  return children;
};

export default ProtectedRoute;
