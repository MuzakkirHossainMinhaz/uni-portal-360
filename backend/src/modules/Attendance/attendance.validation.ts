import { z } from 'zod';

const createAttendanceValidationSchema = z.object({
  body: z.object({
    offeredCourse: z.string({ required_error: 'Offered Course ID is required' }),
    date: z.string({ required_error: 'Date is required' }),
    attendanceList: z.array(
      z.object({
        student: z.string({ required_error: 'Student ID is required' }),
        status: z.enum(['Present', 'Absent', 'Late'], { required_error: 'Status is required' }),
        remark: z.string().optional(),
      })
    ).nonempty({ message: 'Attendance list cannot be empty' }),
  }),
});

export const AttendanceValidation = {
  createAttendanceValidationSchema,
};
