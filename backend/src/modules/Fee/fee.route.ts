import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';
import { FeeControllers } from './fee.controller';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  FeeControllers.createFee,
);

router.get(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.faculty),
  FeeControllers.getAllFees,
);

router.get(
  '/my-fees',
  auth(USER_ROLE.student),
  FeeControllers.getMyFees,
);

router.patch(
    '/:id/pay',
    auth(USER_ROLE.student),
    FeeControllers.payFee
);

export const FeeRoutes = router;
