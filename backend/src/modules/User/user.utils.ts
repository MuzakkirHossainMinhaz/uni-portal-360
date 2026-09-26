import { TAcademicSemester } from '../AcademicSemester/academicSemester.interface';
import { TUserRole } from './user.interface';
import { User } from './user.model';
import { UserIdCounter } from './userIdCounter.model';

const nextId = async (role: TUserRole, prefix: string) => {
  const key = `${role}:${prefix}`;

  // Seed a counter from existing accounts when upgrading an existing database.
  if (!(await UserIdCounter.exists({ _id: key }))) {
    const [last] = await User.aggregate<{ sequence: number }>([
      { $match: { role, id: { $regex: `^${prefix}[0-9]+$` } } },
      { $project: { sequence: { $toInt: { $substrCP: ['$id', prefix.length, 64] } } } },
      { $group: { _id: null, sequence: { $max: '$sequence' } } },
    ]);

    try {
      await UserIdCounter.updateOne(
        { _id: key },
        { $setOnInsert: { sequence: last?.sequence ?? 0 } },
        { upsert: true },
      );
    } catch (error) {
      // Another request may have created the same counter first.
      if (!(error instanceof Error && 'code' in error && error.code === 11000)) throw error;
    }
  }

  const counter = await UserIdCounter.findOneAndUpdate(
    { _id: key },
    { $inc: { sequence: 1 } },
    { new: true },
  );

  if (!counter) throw new Error('Failed to generate user ID');
  return `${prefix}${String(counter.sequence).padStart(4, '0')}`;
};

export const generateStudentId = (semester: TAcademicSemester) =>
  nextId('student', `${semester.year}${semester.code}`);

export const generateFacultyId = () => nextId('faculty', 'F-');

export const generateAdminId = () => nextId('admin', 'A-');
