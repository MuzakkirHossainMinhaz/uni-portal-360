import { z } from 'zod';

const facultyBodySchema = z.object({
  name: z.string({ message: 'Academic faculty must be string' }),
  description: z.string({ message: 'Academic faculty description must be string' }).optional(),
});

const createAcademicFacultyValidationSchema = z.object({ body: facultyBodySchema });

const updateAcademicFacultyValidationSchema = z.object({
  body: facultyBodySchema.partial(),
});

export const AcademicFacultyValidation = {
  createAcademicFacultyValidationSchema,
  updateAcademicFacultyValidationSchema,
};
