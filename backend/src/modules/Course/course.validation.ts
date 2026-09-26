import { z } from 'zod';

const PreRequisiteCourseValidationSchema = z.object({
  course: z.string(),
  isDeleted: z.boolean().optional(),
});

const createCourseValidationSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1),
    prefix: z.string().trim().min(1),
    code: z.number().int().positive(),
    credits: z.number().positive(),
    preRequisiteCourses: z.array(PreRequisiteCourseValidationSchema).optional(),
  }),
});

const updatePreRequisiteCourseValidationSchema = z.object({
  course: z.string(),
  isDeleted: z.boolean().optional(),
});

const updateCourseValidationSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).optional(),
    prefix: z.string().trim().min(1).optional(),
    code: z.number().int().positive().optional(),
    credits: z.number().positive().optional(),
    preRequisiteCourses: z.array(updatePreRequisiteCourseValidationSchema).optional(),
  }),
});

const facultiesWithCourseValidationSchema = z.object({
  body: z.object({
    faculties: z.array(z.string()).min(1),
  }),
});

export const CourseValidations = {
  createCourseValidationSchema,
  updateCourseValidationSchema,
  facultiesWithCourseValidationSchema,
};
