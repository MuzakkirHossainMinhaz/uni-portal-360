import { z } from 'zod';

const createAssignmentValidationSchema = z.object({
  body: z.object({
    title: z.string({
      error: 'Title is required',
    }),
    offeredCourse: z.string({
      error: 'Offered Course ID is required',
    }),
    description: z.string({
      error: 'Description is required',
    }),
    deadline: z.string({
      error: 'Deadline is required',
    }).refine((date) => new Date(date).toString() !== 'Invalid Date', {
      message: 'Invalid deadline date',
    }),
  }),
});

const updateAssignmentValidationSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    offeredCourse: z.string().optional(),
    description: z.string().optional(),
    deadline: z.string().optional(),
  }),
});

export const AssignmentValidations = {
  createAssignmentValidationSchema,
  updateAssignmentValidationSchema,
};
