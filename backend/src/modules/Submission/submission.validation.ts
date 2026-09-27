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
  }),
});

const updateSubmissionValidationSchema = z.object({
  body: z.object({
    fileUrl: z.url().refine((url) => url.startsWith('https://'), 'Use an HTTPS file URL'),
  }),
});

export const SubmissionValidations = {
  createSubmissionValidationSchema,
  updateSubmissionGradeValidationSchema,
  updateSubmissionValidationSchema,
};
