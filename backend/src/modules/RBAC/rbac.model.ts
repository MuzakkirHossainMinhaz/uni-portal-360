import { Schema, model } from 'mongoose';
import { TPermission, TRole, TRolePermission } from './rbac.interface';

// Role Schema
const roleSchema = new Schema<TRole>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const Role = model<TRole>('Role', roleSchema);

// Permission Schema
const permissionSchema = new Schema<TPermission>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const Permission = model<TPermission>('Permission', permissionSchema);

// Role Permission Junction Schema
const rolePermissionSchema = new Schema<TRolePermission>(
  {
    roleId: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    permissionId: {
      type: Schema.Types.ObjectId,
      ref: 'Permission',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound unique index to prevent duplicate assignments
rolePermissionSchema.index({ roleId: 1, permissionId: 1 }, { unique: true });

export const RolePermission = model<TRolePermission>('RolePermission', rolePermissionSchema);
