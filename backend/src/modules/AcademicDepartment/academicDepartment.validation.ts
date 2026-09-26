import { z } from 'zod';

const departmentBodySchema = z.object({
  name: z.string({ message: 'Academic department must be string and is required' }),
  description: z.string({ message: 'Academic department description must be string' }).optional(),
  academicFaculty: z.string({ message: 'Academic faculty must be string and is required' }),
});

const createAcademicDepartmentValidationSchema = z.object({ body: departmentBodySchema });

const updateAcademicDepartmentValidationSchema = z.object({
  body: departmentBodySchema.partial(),
});

export const AcademicDepartmentValidation = {
  createAcademicDepartmentValidationSchema,
  updateAcademicDepartmentValidationSchema,
};
