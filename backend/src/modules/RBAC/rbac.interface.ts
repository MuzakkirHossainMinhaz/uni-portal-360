import { Types } from 'mongoose';

export type TRole = {
  name: string;
  description?: string;
};

export type TPermission = {
  name: string;
  description?: string;
};

export type TRolePermission = {
  roleId: Types.ObjectId;
  permissionId: Types.ObjectId;
};
