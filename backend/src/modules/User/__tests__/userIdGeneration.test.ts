import { generateAdminId, generateFacultyId, generateStudentId } from '../user.utils';
import { User } from '../user.model';
import { UserIdCounter } from '../userIdCounter.model';
import { TAcademicSemester } from '../../AcademicSemester/academicSemester.interface';

jest.mock('../user.model', () => ({ User: { aggregate: jest.fn() } }));
jest.mock('../userIdCounter.model', () => ({
  UserIdCounter: { exists: jest.fn(), updateOne: jest.fn(), findOneAndUpdate: jest.fn() },
}));

describe('user ID generation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (UserIdCounter.exists as jest.Mock).mockResolvedValue(null);
    (UserIdCounter.updateOne as jest.Mock).mockResolvedValue({ upsertedCount: 1 });
  });

  it('continues faculty and admin numbering beyond 0100 when counters are initialized', async () => {
    (User.aggregate as jest.Mock).mockResolvedValue([{ sequence: 100 }]);
    (UserIdCounter.findOneAndUpdate as jest.Mock).mockResolvedValue({ sequence: 101 });

    expect(await generateFacultyId()).toBe('F-0101');
    expect(await generateAdminId()).toBe('A-0101');
    expect(UserIdCounter.updateOne).toHaveBeenCalledWith(
      { _id: 'faculty:F-' },
      { $setOnInsert: { sequence: 100 } },
      { upsert: true },
    );
  });

  it('uses a separate atomic sequence for each admission semester', async () => {
    (UserIdCounter.exists as jest.Mock).mockResolvedValue(true);
    (UserIdCounter.findOneAndUpdate as jest.Mock)
      .mockResolvedValueOnce({ sequence: 23 })
      .mockResolvedValueOnce({ sequence: 7 });
    const autumn = { year: '2026', code: '01' } as TAcademicSemester;
    const summer = { year: '2026', code: '02' } as TAcademicSemester;

    expect(await generateStudentId(autumn)).toBe('2026010023');
    expect(await generateStudentId(summer)).toBe('2026020007');
    expect(UserIdCounter.findOneAndUpdate).toHaveBeenNthCalledWith(
      1,
      { _id: 'student:202601' },
      { $inc: { sequence: 1 } },
      { new: true },
    );
  });

  it('seeds a returning semester from IDs in that semester, not the latest student globally', async () => {
    (User.aggregate as jest.Mock).mockResolvedValue([{ sequence: 15 }]);
    (UserIdCounter.findOneAndUpdate as jest.Mock).mockResolvedValue({ sequence: 16 });

    expect(await generateStudentId({ year: '2026', code: '01' } as TAcademicSemester)).toBe('2026010016');
    expect(User.aggregate).toHaveBeenCalledWith(expect.arrayContaining([
      { $match: { role: 'student', id: { $regex: '^202601[0-9]+$' } } },
    ]));
    expect(UserIdCounter.updateOne).toHaveBeenCalledWith(
      { _id: 'student:202601' },
      { $setOnInsert: { sequence: 15 } },
      { upsert: true },
    );
  });

  it('continues after another request wins the counter initialization race', async () => {
    (User.aggregate as jest.Mock).mockResolvedValue([{ sequence: 3 }]);
    (UserIdCounter.updateOne as jest.Mock).mockRejectedValue(Object.assign(new Error('duplicate'), { code: 11000 }));
    (UserIdCounter.findOneAndUpdate as jest.Mock).mockResolvedValue({ sequence: 5 });

    await expect(generateAdminId()).resolves.toBe('A-0005');
  });

  it('allocates distinct IDs for concurrent requests', async () => {
    (UserIdCounter.exists as jest.Mock).mockResolvedValue(true);
    let sequence = 100;
    (UserIdCounter.findOneAndUpdate as jest.Mock).mockImplementation(async () => ({ sequence: ++sequence }));

    expect(await Promise.all([generateFacultyId(), generateFacultyId()])).toEqual(['F-0101', 'F-0102']);
  });
});
