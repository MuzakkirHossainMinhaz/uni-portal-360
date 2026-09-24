import { z } from 'zod';
import { UserStatus } from './user.constant';
import { createMemberValidationSchema } from '../Member/member.validation';

const userValidationSchema = z.object({
  pasword: z
    .string({
      message: 'Password must be string',
    })
    .max(20, { message: 'Password can not be more than 20 characters' })
    .optional(),
});

const changeStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum([...UserStatus] as [string, ...string[]]),
  }),
});

export const UserValidation = {
  userValidationSchema,
  changeStatusValidationSchema,
  createMemberValidationSchema,
};
