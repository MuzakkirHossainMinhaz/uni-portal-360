import { z } from 'zod';
import { Role } from '../RBAC/rbac.model';
import { USER_ROLE } from './user.constant';
import { User } from './user.model';
import { getRoleDescription } from './user.roles';

export const userDirectoryQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(100).optional(),
    role: z.string().min(1).max(100).optional(),
    includeDeleted: z.enum(['true', 'false']).default('false'),
  })
  .strict();

const getAccounts = async (query: Record<string, unknown>) => {
  const { page, limit, search, role, includeDeleted } = userDirectoryQuerySchema.parse(query);
  const filter: Record<string, unknown> = {};
  if (includeDeleted !== 'true') filter.isDeleted = { $ne: true };
  if (role) filter.role = role;
  if (search) {
    const literalSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = ['id', 'email'].map((field) => ({
      [field]: { $regex: literalSearch, $options: 'i' },
    }));
  }

  const [data, total] = await Promise.all([
    User.find(filter)
      // Explicit allowlist: never expose credentials or arbitrary requested fields.
      .select('_id id email role status isDeleted needsPasswordChange createdAt')
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);
  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total },
  };
};

const getRoles = async () => {
  const [counts, storedRoles] = await Promise.all([
    User.aggregate<{ _id: string; accounts: number; deletedAccounts: number }>([
      {
        $group: {
          _id: '$role',
          accounts: { $sum: { $cond: [{ $eq: ['$isDeleted', true] }, 0, 1] } },
          deletedAccounts: { $sum: { $cond: [{ $eq: ['$isDeleted', true] }, 1, 0] } },
        },
      },
    ]),
    Role.distinct('name'),
  ]);
  const roles = new Set<string>([...Object.values(USER_ROLE), ...storedRoles]);
  for (const row of counts) if (row._id) roles.add(row._id);
  const countsByRole = new Map(counts.map((row) => [row._id, row]));
  return [...roles].map((role) => ({
    role,
    ...getRoleDescription(role),
    accounts: countsByRole.get(role)?.accounts ?? 0,
    deletedAccounts: countsByRole.get(role)?.deletedAccounts ?? 0,
  }));
};

export const UserDirectory = { getAccounts, getRoles };
