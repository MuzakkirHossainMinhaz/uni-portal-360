import { z } from 'zod';

const createAttendanceValidationSchema = z.object({
  body: z.object({
    offeredCourse: z.string({ error: 'Offered Course ID is required' }),
    date: z.string({ error: 'Date is required' }),
    attendanceList: z.array(
      z.object({
        student: z.string({ error: 'Student ID is required' }),
        status: z.enum(['Present', 'Absent', 'Late'], { error: 'Status is required' }),
        remark: z.string().optional(),
      })
    ).nonempty({ message: 'Attendance list cannot be empty' }),
  }),
});

export const AttendanceValidation = {
  createAttendanceValidationSchema,
};
