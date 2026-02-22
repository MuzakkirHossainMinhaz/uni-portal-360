import { z } from 'zod';

export const academicSemesterSchema = z.object({
  name: z.string({ message: 'Please select a Name' }),
  year: z.string({ message: 'Please select a Year' }),
  startMonth: z.string({ message: 'Please select a Start Month' }),
  endMonth: z.string({ message: 'Please select a End Month' }),
});
