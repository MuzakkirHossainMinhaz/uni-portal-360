import { z } from 'zod';
const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid record ID');
const date = z.iso.date();

const createAttendanceValidationSchema = z.object({
  body: z.object({
    offeredCourse: objectId,
    date,
    attendanceList: z
      .array(
        z.object({
          student: objectId,
          status: z.enum(['Present', 'Absent', 'Late'], { error: 'Status is required' }),
          remark: z.string().optional(),
        }),
      )
      .nonempty({ message: 'Attendance list cannot be empty' })
      .refine(
        (records) => new Set(records.map((record) => record.student)).size === records.length,
        'Duplicate student in attendance list',
      ),
  }),
});

export const AttendanceValidations = {
  sheetValidationSchema: z.object({ query: z.object({ offeredCourse: objectId, date }) }),
  createAttendanceValidationSchema,
};
