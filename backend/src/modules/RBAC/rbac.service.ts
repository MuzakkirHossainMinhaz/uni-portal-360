import { logger } from '../../utils/logger';
import { Permission, Role, RolePermission } from './rbac.model';
import { USER_ROLE } from '../User/user.constant';
import { TUserRole } from '../User/user.interface';

const ROLES = Object.values(USER_ROLE);

const PERMISSIONS = [
  // User Management
  'createStudent',
  'deleteStudent',
  'updateStudent',
  'getStudent',
  'createFaculty',
  'deleteFaculty',
  'updateFaculty',
  'getFaculty',
  'createAdmin',
  'deleteAdmin',
  'updateAdmin',
  'getAdmin',

  // Academic Management
  'createAcademicSemester',
  'updateAcademicSemester',
  'getAcademicSemester',
  'createAcademicDepartment',
  'updateAcademicDepartment',
  'getAcademicDepartment',
  'createAcademicFaculty',
  'updateAcademicFaculty',
  'getAcademicFaculty',

  // Course Management
  'createCourse',
  'updateCourse',
  'deleteCourse',
  'getCourse',
  'assignFaculties',
  'removeFaculties',

  // Offered Course
  'createOfferedCourse',
  'updateOfferedCourse',
  'deleteOfferedCourse',
  'getOfferedCourse',

  // Semester Registration
  'createSemesterRegistration',
  'updateSemesterRegistration',
  'deleteSemesterRegistration',
  'getSemesterRegistration',

  // Enrollment
  'enrollCourse',
  'withdrawCourse',
  'getMyEnrolledCourses',

  // Assignment & Grading
  'createAssignment',
  'submitAssignment',
  'gradeAssignment',
  'viewAssignment',
  'viewSubmission',

  // Results
  'viewResult',
  'publishResult',
];

const ROLE_PERMISSIONS: Record<TUserRole, string[]> = {
  superAdmin: PERMISSIONS, // All permissions
  admin: [
    'createStudent',
    'deleteStudent',
    'updateStudent',
    'getStudent',
    'createFaculty',
    'deleteFaculty',
    'updateFaculty',
    'getFaculty',
    'createAdmin',
    'deleteAdmin',
    'updateAdmin',
    'getAdmin',
    'createAcademicSemester',
    'updateAcademicSemester',
    'getAcademicSemester',
    'createAcademicDepartment',
    'updateAcademicDepartment',
    'getAcademicDepartment',
    'createAcademicFaculty',
    'updateAcademicFaculty',
    'getAcademicFaculty',
    'createCourse',
    'updateCourse',
    'deleteCourse',
    'getCourse',
    'assignFaculties',
    'removeFaculties',
    'createOfferedCourse',
    'updateOfferedCourse',
    'deleteOfferedCourse',
    'getOfferedCourse',
    'createSemesterRegistration',
    'updateSemesterRegistration',
    'deleteSemesterRegistration',
    'getSemesterRegistration',
    'publishResult',
  ],
  faculty: [
    'getStudent',
    'getAcademicSemester',
    'getAcademicDepartment',
    'getAcademicFaculty',
    'getCourse',
    'getOfferedCourse',
    'getMyEnrolledCourses',
    'createAssignment',
    'gradeAssignment',
    'viewAssignment',
    'viewSubmission',
    'viewResult',
  ],
  student: [
    'getAcademicSemester',
    'getAcademicDepartment',
    'getAcademicFaculty',
    'getCourse',
    'getOfferedCourse',
    'enrollCourse',
    'withdrawCourse',
    'getMyEnrolledCourses',
    'submitAssignment',
    'viewAssignment',
    'viewResult',
  ],
};

const seedRBAC = async () => {
  try {
    let permissionsInserted = 0;
    for (const permName of PERMISSIONS) {
      const result = await Permission.updateOne(
        { name: permName },
        { $setOnInsert: { name: permName, description: `Permission to ${permName}` } },
        { upsert: true },
      );
      permissionsInserted += result.upsertedCount;
    }
    if (permissionsInserted > 0) {
      logger.info(`RBAC: ${permissionsInserted} new permission(s) seeded`);
    }

    let rolesInserted = 0;
    for (const roleName of ROLES) {
      const result = await Role.updateOne(
        { name: roleName },
        { $setOnInsert: { name: roleName, description: `${roleName} role` } },
        { upsert: true },
      );
      rolesInserted += result.upsertedCount;
    }
    if (rolesInserted > 0) {
      logger.info(`RBAC: ${rolesInserted} new role(s) seeded`);
    }

    let rolePermsInserted = 0;
    for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      const role = await Role.findOne({ name: roleName });
      if (!role) continue;

      for (const permName of permissions) {
        const permission = await Permission.findOne({ name: permName });
        if (!permission) continue;

        const result = await RolePermission.updateOne(
          { roleId: role._id, permissionId: permission._id },
          { $setOnInsert: { roleId: role._id, permissionId: permission._id } },
          { upsert: true },
        );
        rolePermsInserted += result.upsertedCount;
      }
    }
    if (rolePermsInserted > 0) {
      logger.info(`RBAC: ${rolePermsInserted} new role-permission mapping(s) seeded`);
    }
  } catch (error) {
    logger.error('Error seeding RBAC', error);
  }
};

const hasPermission = async (roleName: string, permissionName: string): Promise<boolean> => {
  if (roleName === 'superAdmin') return true;

  const role = await Role.findOne({ name: roleName });
  if (!role) return false;

  const permission = await Permission.findOne({ name: permissionName });
  if (!permission) return false;

  const rolePermission = await RolePermission.findOne({
    roleId: role._id,
    permissionId: permission._id,
  });

  return !!rolePermission;
};

const getRolePermissions = async (roleName: string): Promise<string[]> => {
  if (roleName === 'superAdmin') {
    const allPermissions = await Permission.find({});
    return allPermissions.map((p) => p.name);
  }

  const role = await Role.findOne({ name: roleName });
  if (!role) return [];

  const rolePermissions = await RolePermission.find({ roleId: role._id }).populate('permissionId');

  return rolePermissions
    .map((rp) => {
      if (!rp.permissionId) {
        return '';
      }
      if (typeof rp.permissionId === 'string') {
        return rp.permissionId;
      }
      const populated: unknown = rp.permissionId;
      return typeof populated === 'object' && populated !== null && 'name' in populated &&
        typeof populated.name === 'string'
        ? populated.name
        : '';
    })
    .filter(Boolean);
};

export const RBACService = {
  seedRBAC,
  hasPermission,
  getRolePermissions,
};
