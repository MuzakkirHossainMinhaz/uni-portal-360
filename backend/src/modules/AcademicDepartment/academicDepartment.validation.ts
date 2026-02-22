import { z } from 'zod';

const createAcademicDepartmentValidationSchema = z.object({
  body: z.object({
    name: z.string({
      message: 'Academic department must be string and is required',
    }),
    academicFaculty: z.string({
      message: 'Academic faculty must be string and is required',
    }),
  }),
});

const updateAcademicDepartmentValidationSchema = z.object({
  body: z.object({
    name: z
      .string({
        message: 'Academic department must be string',
      })
      .optional(),
    academicFaculty: z
      .string({
        message: 'Academic faculty must be string',
      })
      .optional(),
  }),
});

export const AcademicDepartmentValidation = {
  createAcademicDepartmentValidationSchema,
  updateAcademicDepartmentValidationSchema,
};
