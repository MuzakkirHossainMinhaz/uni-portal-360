import { z } from 'zod';

const createSubmissionValidationSchema = z.object({
  body: z.object({
    assignment: z
      .string({
        error: 'Assignment ID is required',
      })
      .regex(/^[a-f\d]{24}$/i, 'Invalid assignment ID'),
  }),
});

const updateSubmissionGradeValidationSchema = z.object({
  body: z.object({
    grade: z
      .number({
        error: 'Grade is required',
      })
      .min(0)
      .max(100),
    feedback: z.string().optional(),
    correctionReason: z.string().trim().min(10).max(1000).optional(),
  }),
});

export const SubmissionValidations = {
  createSubmissionValidationSchema,
  updateSubmissionGradeValidationSchema,
};
