import { z } from 'zod';
import { passwordSchema } from '../../utils/passwordPolicy';

const loginValidationSchema = z.object({
  body: z.object({
    id: z.string({ message: 'Id is required.' }),
    password: z.string({ message: 'Password is required' }),
  }),
});

const changePasswordValidationSchema = z.object({
  body: z.object({
    oldPassword: z.string({
      message: 'Old password is required',
    }),
    newPassword: passwordSchema,
  }),
});

const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      message: 'Refresh token is required!',
    }),
  }),
});

const forgetPasswordValidationSchema = z.object({
  body: z.object({
    id: z.string({
      message: 'User id is required!',
    }),
  }),
});

const resetPasswordValidationSchema = z.object({
  body: z.object({
    id: z.string({
      message: 'User id is required!',
    }),
    newPassword: passwordSchema,
  }),
});

export const AuthValidations = {
  loginValidationSchema,
  changePasswordValidationSchema,
  refreshTokenValidationSchema,
  forgetPasswordValidationSchema,
  resetPasswordValidationSchema,
};
