import { ReactNode } from 'react';
import { useAppSelector } from '../../redux/hooks';
import { selectUserPermissions, selectCurrentUser } from '../../redux/features/auth/authSlice';

type PermissionGuardProps = {
  children: ReactNode;
  permission: string;
  fallback?: ReactNode;
};

const PermissionGuard = ({ children, permission, fallback = null }: PermissionGuardProps) => {
  const user = useAppSelector(selectCurrentUser);
  const permissions = useAppSelector(selectUserPermissions);

  if (!user) {
    return <>{fallback}</>;
  }

  // SuperAdmin has all permissions
  if (user.role === 'superAdmin') {
    return <>{children}</>;
  }

  if (permissions.includes(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default PermissionGuard;
