import { z } from 'zod';

const createSubmissionValidationSchema = z.object({
  body: z.object({
    assignment: z.string({
      required_error: 'Assignment ID is required',
    }),
  }),
});

const updateSubmissionGradeValidationSchema = z.object({
  body: z.object({
    grade: z.number({
      required_error: 'Grade is required',
    }),
    feedback: z.string().optional(),
  }),
});

export const SubmissionValidations = {
  createSubmissionValidationSchema,
  updateSubmissionGradeValidationSchema,
};
