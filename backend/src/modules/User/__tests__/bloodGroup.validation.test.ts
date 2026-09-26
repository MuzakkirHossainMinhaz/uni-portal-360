import { createAdminValidationSchema } from '../../Admin/admin.validation';
import { createFacultyValidationSchema } from '../../Faculty/faculty.validation';
import { createStudentValidationSchema } from '../../Student/student.validation';

type ValidationCase = {
  profileKey: 'admin' | 'faculty' | 'student';
  payload: {
    body: Record<string, unknown>;
  };
  schema: {
    safeParse: (value: unknown) => { success: boolean };
  };
};

const cases: ValidationCase[] = [
  {
    profileKey: 'admin',
    schema: createAdminValidationSchema,
    payload: {
      body: {
        admin: {
          designation: 'Registrar',
          name: { firstName: 'Ada', middleName: '', lastName: 'Lovelace' },
          gender: 'female',
          email: 'ada@example.com',
          contactNo: '01234567890',
          emergencyContactNo: '01234567891',
          bloodGroup: 'A+',
          presentAddress: 'Present address',
          permanentAddress: 'Permanent address',
        },
      },
    },
  },
  {
    profileKey: 'faculty',
    schema: createFacultyValidationSchema,
    payload: {
      body: {
        faculty: {
          designation: 'Professor',
          name: { firstName: 'Grace', middleName: '', lastName: 'Hopper' },
          gender: 'female',
          email: 'grace@example.com',
          contactNo: '01234567890',
          emergencyContactNo: '01234567891',
          bloodGroup: 'B+',
          presentAddress: 'Present address',
          permanentAddress: 'Permanent address',
          academicDepartment: 'department-id',
        },
      },
    },
  },
  {
    profileKey: 'student',
    schema: createStudentValidationSchema,
    payload: {
      body: {
        student: {
          name: { firstName: 'Katherine', middleName: '', lastName: 'Johnson' },
          gender: 'female',
          email: 'katherine@example.com',
          contactNo: '01234567890',
          emergencyContactNo: '01234567891',
          bloodGroup: 'O+',
          presentAddress: 'Present address',
          permanentAddress: 'Permanent address',
          guardian: {
            fatherName: 'Father',
            fatherOccupation: 'Engineer',
            fatherContactNo: '01234567892',
            motherName: 'Mother',
            motherOccupation: 'Teacher',
            motherContactNo: '01234567893',
          },
          localGuardian: {
            name: 'Guardian',
            occupation: 'Teacher',
            contactNo: '01234567894',
            address: 'Guardian address',
          },
          admissionSemester: 'semester-id',
          academicDepartment: 'department-id',
        },
      },
    },
  },
];

describe.each(cases)('$profileKey blood-group validation', ({ profileKey, payload, schema }) => {
  it('accepts the canonical bloodGroup field', () => {
    expect(schema.safeParse(payload).success).toBe(true);
  });

  it('rejects the former bloogGroup misspelling', () => {
    const invalidPayload = structuredClone(payload);
    const profile = invalidPayload.body[profileKey] as Record<string, unknown>;

    profile.bloogGroup = profile.bloodGroup;
    delete profile.bloodGroup;

    expect(schema.safeParse(invalidPayload).success).toBe(false);
  });
});
