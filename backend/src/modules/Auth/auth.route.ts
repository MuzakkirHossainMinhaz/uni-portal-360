import express from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { createHash } from 'crypto';
import { authForPasswordChange } from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../User/user.constant';
import { AuthControllers } from './auth.controller';
import { AuthValidations } from './auth.validation';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: 'Too many login attempts. Please try again later',
  keyGenerator: (req) =>
    `${ipKeyGenerator(req.ip ?? 'unknown')}:${createHash('sha256')
      .update(String(req.body?.id ?? '').toLowerCase())
      .digest('hex')}`,
});

router.post('/login', loginLimiter, validateRequest(AuthValidations.loginValidationSchema), AuthControllers.loginUser);

router.post(
  '/change-password',
  authForPasswordChange(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.faculty, USER_ROLE.student),
  validateRequest(AuthValidations.changePasswordValidationSchema),
  AuthControllers.changePassword,
);

router.post(
  '/refresh-token',
  validateRequest(AuthValidations.refreshTokenValidationSchema),
  AuthControllers.refreshToken,
);

router.post(
  '/logout',
  authForPasswordChange(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.faculty, USER_ROLE.student),
  AuthControllers.logoutUser,
);

router.post(
  '/forget-password',
  validateRequest(AuthValidations.forgetPasswordValidationSchema),
  AuthControllers.forgetPassword,
);

router.post(
  '/reset-password',
  validateRequest(AuthValidations.resetPasswordValidationSchema),
  AuthControllers.resetPassword,
);

export const AuthRoutes = router;
