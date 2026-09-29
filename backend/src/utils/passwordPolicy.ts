import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .max(128, 'Password must be at most 128 characters')
  .refine((value) => value.trim().length >= 12, 'Password cannot be blank');
