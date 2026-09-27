import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID');
const dueDate = z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid due date');
const feeType = z.enum(['TUITION', 'LIBRARY', 'EXAM', 'HOSTEL', 'MISC']);

const createFee = z.object({
  body: z
    .object({
      student: objectId,
      academicSemester: objectId,
      type: feeType,
      amount: z.number().finite().positive(),
      dueDate,
      description: z.string().trim().max(500).optional(),
    })
    .strict(),
});

const updateFee = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object({
      type: feeType.optional(),
      amount: z.number().finite().positive().optional(),
      dueDate: dueDate.optional(),
      description: z.string().trim().max(500).optional(),
    })
    .strict()
    .refine((value) => Object.keys(value).length > 0, 'Provide at least one change'),
});

const feeId = z.object({ params: z.object({ id: objectId }) });

export const FeeValidations = { createFee, updateFee, feeId };
