import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Spin } from 'antd';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { TUser } from '../../redux/features/auth/authSlice';
import {
  logout,
  selectCurrentUser,
  setPermissions,
  setUser,
  useCurrentToken,
} from '../../redux/features/auth/authSlice';
import { useGetMyPermissionsQuery, useRefreshSessionMutation } from '../../redux/features/auth/auth.api';
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
  const [refreshSession] = useRefreshSessionMutation();
  const [refreshFailed, setRefreshFailed] = useState(false);
  const attemptedToken = useRef<string | null>(null);

  let user: TUser | undefined;
  let hasInvalidSession = false;
  let isExpired = false;

  if (token) {
    try {
      user = verifyToken(token) as TUser;
      hasInvalidSession = !user.exp || !user.role || !user.userId;
      isExpired = !hasInvalidSession && user.exp * 1000 <= Date.now();
    } catch {
      hasInvalidSession = true;
    }
  }

  const allowedRoles = role?.split('|');
  const hasInvalidRole = Boolean(allowedRoles && !allowedRoles.includes(user?.role || ''));
  const shouldLogout = Boolean(token) && (hasInvalidSession || !currentUser || (isExpired && refreshFailed));
  const shouldLoadPermissions = Boolean(
    token && !shouldLogout && !isExpired && !currentUser?.needsPasswordChange && !currentUser?.permissions,
  );
  const { data: permissions } = useGetMyPermissionsQuery(undefined, { skip: !shouldLoadPermissions });

  useEffect(() => {
    if (!token || !isExpired || shouldLogout || attemptedToken.current === token) return;
    attemptedToken.current = token;
    void refreshSession()
      .unwrap()
      .then((response) => {
        const accessToken = response.data?.accessToken;
        if (!accessToken) throw new Error('Refresh response missing an access token');
        dispatch(
          setUser({
            user: {
              ...(verifyToken(accessToken) as TUser),
              permissions: currentUser?.permissions,
              needsPasswordChange: currentUser?.needsPasswordChange,
            },
            token: accessToken,
          }),
        );
      })
      .catch(() => setRefreshFailed(true));
  }, [token, isExpired, shouldLogout, refreshSession, dispatch, currentUser]);

  useEffect(() => {
    if (permissions && shouldLoadPermissions) dispatch(setPermissions(permissions));
  }, [dispatch, permissions, shouldLoadPermissions]);

  useEffect(() => {
    if (!shouldLogout) {
      return;
    }

    dispatch(logout());

    if (hasInvalidSession || refreshFailed) {
      toast.error('Your session has expired. Please log in again.', {
        id: 'session-expired',
      });
    }
  }, [dispatch, hasInvalidSession, refreshFailed, shouldLogout]);

  if (!token || shouldLogout) {
    return <Navigate to="/login" replace />;
  }

  if (isExpired) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <Spin aria-label="Restoring session" />
      </div>
    );
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
