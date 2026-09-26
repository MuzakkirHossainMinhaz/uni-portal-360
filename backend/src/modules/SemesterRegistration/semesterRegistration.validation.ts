import { z } from 'zod';
import { SemesterRegistrationStatus } from './semesterRegistration.constant';

const createSemesterRegistrationValidationSchema = z.object({
  body: z.object({
    academicSemester: z.string(),
    status: z.enum([...(SemesterRegistrationStatus as [string, ...string[]])]),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    minCredit: z.number().nonnegative(),
    maxCredit: z.number().positive(),
  }).refine((value) => value.startDate < value.endDate && value.minCredit <= value.maxCredit, {
    message: 'Check the registration dates and credit limits',
  }),
});

const upadateSemesterRegistrationValidationSchema = z.object({
  body: z.object({
    academicSemester: z.string().optional(),
    status: z.enum([...(SemesterRegistrationStatus as [string, ...string[]])]).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    minCredit: z.number().nonnegative().optional(),
    maxCredit: z.number().positive().optional(),
  }),
});

export const SemesterRegistrationValidations = {
  createSemesterRegistrationValidationSchema,
  upadateSemesterRegistrationValidationSchema,
};
