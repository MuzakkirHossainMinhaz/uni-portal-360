import { z } from 'zod';

const createAcademicFacultyValidationSchema = z.object({
  body: z.object({
    name: z.string({
      message: 'Academic faculty must be string',
    }),
    description: z
      .string({
        message: 'Academic faculty description must be string',
      })
      .optional(),
  }),
});

const updateAcademicFacultyValidationSchema = z.object({
  body: z.object({
    name: z.string({
      message: 'Academic faculty must be string',
    }),
    description: z
      .string({
        message: 'Academic faculty description must be string',
      })
      .optional(),
  }),
});

export const AcademicFacultyValidation = {
  createAcademicFacultyValidationSchema,
  updateAcademicFacultyValidationSchema,
};
