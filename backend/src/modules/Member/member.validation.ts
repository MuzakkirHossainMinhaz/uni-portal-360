import { z } from 'zod';

const createMemberDataSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  contactNo: z.string().optional().default(''),
  address: z.string().optional().default(''),
  membershipType: z.string().optional().default('standard'),
  profileImg: z.string().optional(),
});

export const createMemberValidationSchema = z.object({
  body: z.union([
    z.object({
      password: z.string().max(20).optional(),
      member: createMemberDataSchema,
    }),
    createMemberDataSchema.extend({
      password: z.string().max(20).optional(),
    }),
  ]),
});

const updateMemberDataSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  contactNo: z.string().optional(),
  address: z.string().optional(),
  membershipType: z.string().optional(),
  profileImg: z.string().optional(),
});

export const updateMemberValidationSchema = z.object({
  body: z.union([
    z.object({
      member: updateMemberDataSchema,
    }),
    updateMemberDataSchema,
  ]),
});

export const MemberValidations = {
  createMemberValidationSchema,
  updateMemberValidationSchema,
};
