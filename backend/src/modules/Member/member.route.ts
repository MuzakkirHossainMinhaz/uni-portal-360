import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../User/user.constant';
import { MemberControllers } from './member.controller';
import { MemberValidations } from './member.validation';

const router = express.Router();

router.get('/', auth(USER_ROLE.superAdmin, USER_ROLE.admin), MemberControllers.getAllMembers);

router.get('/:id', auth(USER_ROLE.superAdmin, USER_ROLE.admin), MemberControllers.getSingleMember);

router.patch(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(MemberValidations.updateMemberValidationSchema),
  MemberControllers.updateMember,
);

router.delete('/:id', auth(USER_ROLE.superAdmin, USER_ROLE.admin), MemberControllers.deleteMember);

export const MemberRoutes = router;
