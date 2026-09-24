import { UserDirectory, userDirectoryQuerySchema } from '../user.directory';
import { User } from '../user.model';
import { Role } from '../../RBAC/rbac.model';
import { USER_ROLE } from '../user.constant';
import { getRoleDescription, USER_ROLE_DETAILS } from '../user.roles';

jest.mock('../user.model', () => ({
  User: { find: jest.fn(), countDocuments: jest.fn(), aggregate: jest.fn() },
}));
jest.mock('../../RBAC/rbac.model', () => ({ Role: { distinct: jest.fn() } }));

describe('User account directory', () => {
  beforeEach(() => jest.clearAllMocks());

  const mockQuery = (data: unknown[]) => {
    const query = {
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(data),
    };
    (User.find as jest.Mock).mockReturnValue(query);
    (User.countDocuments as jest.Mock).mockResolvedValue(21);
    return query;
  };

  it('includes profile-less Super Admin accounts and exposes only safe fields with bounded pagination', async () => {
    const owner = { id: 'SA-0001', role: 'superAdmin' };
    const query = mockQuery([owner]);
    const result = await UserDirectory.getAccounts({ page: '2', limit: '20' });

    expect(User.find).toHaveBeenCalledWith({ isDeleted: { $ne: true } });
    expect(User.countDocuments).toHaveBeenCalledWith({ isDeleted: { $ne: true } });
    expect(query.select).toHaveBeenCalledWith('_id id email role status isDeleted needsPasswordChange createdAt');
    expect(query.skip).toHaveBeenCalledWith(20);
    expect(query.limit).toHaveBeenCalledWith(20);
    expect(result).toEqual({
      data: [owner],
      meta: {
        page: 2,
        limit: 20,
        total: 21,
        totalPages: 2,
        hasNext: false,
      },
    });
  });

  it('searches literal text and permits inspecting legacy roles/deleted accounts', async () => {
    mockQuery([]);
    await UserDirectory.getAccounts({ search: 'a+.*@example.com', role: 'oldStaff', includeDeleted: 'true' });
    const filter = (User.find as jest.Mock).mock.calls[0][0];
    expect(filter.role).toBe('oldStaff');
    expect(filter.isDeleted).toBeUndefined();
    const pattern = filter.$or[0].id.$regex;
    expect(new RegExp(pattern).test('a+.*@example.com')).toBe(true);
    expect(new RegExp(pattern).test('aaaa@example.com')).toBe(false);
    expect(filter.$or[1].email.$regex).toBe(pattern);
  });

  it.each([
    { limit: '101' },
    { limit: '-1' },
    { page: '0' },
    { page: '1.5' },
    { role: { $ne: 'student' } },
    { includeDeleted: 'yes' },
    { fields: '+password' },
    { search: 'x'.repeat(101) },
  ])('rejects invalid filters or attempts to request arbitrary fields: %j', async (query) => {
    expect(userDirectoryQuerySchema.safeParse(query).success).toBe(false);
    await expect(UserDirectory.getAccounts(query)).rejects.toThrow();
    expect(User.find).not.toHaveBeenCalled();
  });

  it('reports all supported, legacy, and unexpected stored roles without making them supported', async () => {
    (User.aggregate as jest.Mock).mockResolvedValue([
      { _id: 'superAdmin', accounts: 1, deletedAccounts: 0 },
      { _id: 'student', accounts: 2, deletedAccounts: 1 },
      { _id: 'oldStaff', accounts: 1, deletedAccounts: 0 },
    ]);
    (Role.distinct as jest.Mock).mockResolvedValue(['oldRole']);
    const result = await UserDirectory.getRoles();
    expect(result.map((item) => item.role)).toEqual(
      expect.arrayContaining([...Object.values(USER_ROLE), 'oldStaff', 'oldRole']),
    );
    expect(result.find((item) => item.role === 'student')).toMatchObject({
      category: 'Core',
      portal: '/student/dashboard',
      accounts: 2,
      deletedAccounts: 1,
    });
    for (const role of ['oldStaff', 'oldRole']) {
      expect(result.find((item) => item.role === role)).toMatchObject({
        category: 'Unsupported',
        portal: null,
        managementPath: null,
      });
    }
    expect(result.find((item) => item.role === 'faculty')?.accounts).toBe(0);
  });

  it('documents each supported role and safely treats arbitrary names as unsupported', () => {
    expect(Object.values(USER_ROLE).sort()).toEqual(['admin', 'faculty', 'student', 'superAdmin']);
    expect(Object.keys(USER_ROLE_DETAILS).sort()).toEqual(Object.values(USER_ROLE).sort());
    expect(getRoleDescription('__proto__').category).toBe('Unsupported');
    expect(getRoleDescription('oldRole').portal).toBeNull();
  });
});
