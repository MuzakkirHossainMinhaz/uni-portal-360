import { USER_ROLE } from './user.constant';
import { TUserRole } from './user.interface';

type RoleDescription = {
  label: string;
  category: 'Core' | 'System owner' | 'Unsupported';
  purpose: string;
  portal: string | null;
  managementPath: string | null;
};

// Describes implemented behavior, not a new set of authorization rules.
export const USER_ROLE_DETAILS: Record<TUserRole, RoleDescription> = {
  admin: {
    label: 'Admin',
    category: 'Core',
    purpose:
      'Manages students, faculty, academics, courses, fees, reports and audit logs. Can create admins; editing or deleting admins requires Super Admin.',
    portal: '/admin/dashboard',
    managementPath: '/admin/admins',
  },
  faculty: {
    label: 'Faculty',
    category: 'Core',
    purpose:
      'Teaches assigned courses, creates assignments, grades submissions and records course marks. Attendance APIs exist; the attendance screen is not fully connected.',
    portal: '/faculty/dashboard',
    managementPath: '/admin/faculty',
  },
  student: {
    label: 'Student',
    category: 'Core',
    purpose:
      'Enrolls in offered courses and views schedules, assignments, results, attendance and fees. Submits assignments and uses the existing fee-payment workflow.',
    portal: '/student/dashboard',
    managementPath: '/admin/students',
  },
  superAdmin: {
    label: 'Super Admin',
    category: 'System owner',
    purpose:
      'Bootstrap system-owner account using the Admin portal. Can edit and delete admins and bypass permission checks, but explicit API role restrictions still apply. Listed here even without an Admin profile.',
    portal: '/admin/dashboard',
    managementPath: null,
  },
};

export const getRoleDescription = (role: string): RoleDescription => {
  if (Object.values(USER_ROLE).some((value) => value === role)) {
    return USER_ROLE_DETAILS[role as TUserRole];
  }
  return {
    label: role,
    category: 'Unsupported',
    purpose:
      'Stored role with no supported account creation flow or portal in this application. Review it before assigning any access.',
    portal: null,
    managementPath: null,
  };
};
