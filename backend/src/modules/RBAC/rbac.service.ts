import { Permission, Role, RolePermission } from './rbac.model';
import { logger } from '../../utils/logger';

const ROLES = ['admin', 'faculty', 'student', 'superAdmin', 'registrar'];

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

const ROLE_PERMISSIONS: Record<string, string[]> = {
  superAdmin: PERMISSIONS, // All permissions
  admin: [
    'createStudent', 'deleteStudent', 'updateStudent', 'getStudent',
    'createFaculty', 'deleteFaculty', 'updateFaculty', 'getFaculty',
    'createAdmin', 'deleteAdmin', 'updateAdmin', 'getAdmin',
    'createAcademicSemester', 'updateAcademicSemester', 'getAcademicSemester',
    'createAcademicDepartment', 'updateAcademicDepartment', 'getAcademicDepartment',
    'createAcademicFaculty', 'updateAcademicFaculty', 'getAcademicFaculty',
    'createCourse', 'updateCourse', 'deleteCourse', 'getCourse',
    'assignFaculties', 'removeFaculties',
    'createOfferedCourse', 'updateOfferedCourse', 'deleteOfferedCourse', 'getOfferedCourse',
    'createSemesterRegistration', 'updateSemesterRegistration', 'deleteSemesterRegistration', 'getSemesterRegistration',
    'publishResult',
  ],
  registrar: [
    'createAcademicSemester', 'updateAcademicSemester', 'getAcademicSemester',
    'createAcademicDepartment', 'updateAcademicDepartment', 'getAcademicDepartment',
    'createAcademicFaculty', 'updateAcademicFaculty', 'getAcademicFaculty',
    'createCourse', 'updateCourse', 'getCourse',
    'createOfferedCourse', 'updateOfferedCourse', 'getOfferedCourse',
    'createSemesterRegistration', 'updateSemesterRegistration', 'getSemesterRegistration',
  ],
  faculty: [
    'getStudent',
    'getAcademicSemester',
    'getAcademicDepartment',
    'getAcademicFaculty',
    'getCourse',
    'getOfferedCourse',
    'getMyEnrolledCourses',
    'createAssignment', 'gradeAssignment', 'viewAssignment', 'viewSubmission',
    'viewResult',
  ],
  student: [
    'getAcademicSemester',
    'getAcademicDepartment',
    'getAcademicFaculty',
    'getCourse',
    'getOfferedCourse',
    'enrollCourse', 'withdrawCourse', 'getMyEnrolledCourses',
    'submitAssignment', 'viewAssignment',
    'viewResult',
  ],
};

const seedRBAC = async () => {
  try {
    for (const permName of PERMISSIONS) {
      await Permission.updateOne(
        { name: permName },
        { name: permName, description: `Permission to ${permName}` },
        { upsert: true }
      );
    }
    logger.info('Permissions seeded');

    for (const roleName of ROLES) {
      await Role.updateOne(
        { name: roleName },
        { name: roleName, description: `${roleName} role` },
        { upsert: true }
      );
    }
    logger.info('Roles seeded');

    for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      const role = await Role.findOne({ name: roleName });
      if (!role) continue;

      for (const permName of permissions) {
        const permission = await Permission.findOne({ name: permName });
        if (!permission) continue;

        await RolePermission.updateOne(
          { roleId: role._id, permissionId: permission._id },
          { roleId: role._id, permissionId: permission._id },
          { upsert: true }
        );
      }
    }
    logger.info('RolePermissions seeded');
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
        return allPermissions.map(p => p.name);
    }

    const role = await Role.findOne({ name: roleName });
    if (!role) return [];

    const rolePermissions = await RolePermission.find({ roleId: role._id }).populate('permissionId');

    return rolePermissions.map((rp) => {
      if (!rp.permissionId) {
        return '';
      }
      if (typeof rp.permissionId === 'string') {
        return rp.permissionId;
      }
      return rp.permissionId.name;
    }).filter(Boolean);
};

export const RBACService = {
  seedRBAC,
  hasPermission,
  getRolePermissions,
};
