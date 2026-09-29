import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../User/user.constant';
import { FeeControllers } from './fee.controller';
import { FeeValidations } from './fee.validation';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  validateRequest(FeeValidations.createFee),
  FeeControllers.createFee,
);

router.get('/', auth(USER_ROLE.admin, USER_ROLE.superAdmin), FeeControllers.getAllFees);

router.get('/my-fees', auth(USER_ROLE.student), FeeControllers.getMyFees);

router.get('/my-fees/summary', auth(USER_ROLE.student), FeeControllers.getMyFeeSummary);

router.patch('/:id/pay', auth(USER_ROLE.student), validateRequest(FeeValidations.feeId), FeeControllers.payFee);

router.patch(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  validateRequest(FeeValidations.updateFee),
  FeeControllers.updateFee,
);
router.delete(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  validateRequest(FeeValidations.feeId),
  FeeControllers.deleteFee,
);

export const FeeRoutes = router;
