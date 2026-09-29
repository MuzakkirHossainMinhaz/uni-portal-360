import { z } from 'zod';

const createEnrolledCourseValidationZodSchema = z.object({
  body: z.object({
    offeredCourse: z.string(),
  }),
});

const updateEnrolledCourseMarksValidationZodSchema = z.object({
  body: z
    .object({
      semesterRegistration: z.string(),
      offeredCourse: z.string(),
      student: z.string(),
      publish: z.boolean().optional(),
      correctionReason: z.string().trim().min(10).max(500).optional(),
      courseMarks: z
        .object({
          classTest1: z.number().min(0).max(10).optional(),
          midTerm: z.number().min(0).max(30).optional(),
          classTest2: z.number().min(0).max(10).optional(),
          finalTerm: z.number().min(0).max(50).optional(),
        })
        .optional(),
    })
    .refine((body) => body.publish || Object.keys(body.courseMarks ?? {}).length > 0, 'Provide marks or publish'),
});

export const EnrolledCourseValidations = {
  createEnrolledCourseValidationZodSchema,
  updateEnrolledCourseMarksValidationZodSchema,
};
