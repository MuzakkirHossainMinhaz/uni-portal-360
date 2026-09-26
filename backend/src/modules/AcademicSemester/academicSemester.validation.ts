import { z } from 'zod';
import { AcademicSemesterCode, AcademicSemesterName, Months } from './academicSemester.constant';

const semesterBodySchema = z.object({
  name: z.enum([...AcademicSemesterName] as [string, ...string[]]),
  year: z.string(),
  code: z.enum([...AcademicSemesterCode] as [string, ...string[]]),
  startMonth: z.enum([...Months] as [string, ...string[]]),
  endMonth: z.enum([...Months] as [string, ...string[]]),
});

const createAcademicSemesterValidationSchema = z.object({ body: semesterBodySchema });

const updateAcademicSemesterValidationSchema = z.object({
  body: semesterBodySchema.partial(),
});

export const AcademicSemesterValidations = {
  createAcademicSemesterValidationSchema,
  updateAcademicSemesterValidationSchema,
};
