import { UserServices } from '../user.service';
import { User } from '../user.model';
import { StudentServices } from '../../Student/student.service';
import { Student } from '../../Student/student.model';
import { Faculty } from '../../Faculty/faculty.model';
import EnrolledCourse from '../../EnrolledCourse/enrolledCourse.model';

jest.mock('../user.model', () => ({ User: { findById: jest.fn(), findByIdAndUpdate: jest.fn() } }));
jest.mock('../../Student/student.model', () => ({ Student: { findOne: jest.fn() } }));
jest.mock('../../Faculty/faculty.model', () => ({ Faculty: { findOne: jest.fn() } }));
jest.mock('../../EnrolledCourse/enrolledCourse.model', () => ({ __esModule: true, default: { exists: jest.fn() } }));

describe('account status authorization', () => {
  beforeEach(() => jest.clearAllMocks());

  it('does not allow an admin to block a Super Admin', async () => {
    (User.findById as jest.Mock).mockResolvedValue({ id: 'SA-0001', role: 'superAdmin' });
    await expect(
      UserServices.changeStatus('target', { status: 'blocked' }, { userId: 'A-0001', role: 'admin' }),
    ).rejects.toMatchObject({ statusCode: 403 });
    expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('does not allow an administrator to block their own account', async () => {
    (User.findById as jest.Mock).mockResolvedValue({ id: 'A-0001', role: 'admin' });
    await expect(
      UserServices.changeStatus('target', { status: 'blocked' }, { userId: 'A-0001', role: 'admin' }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('allows an admin to change another ordinary account', async () => {
    (User.findById as jest.Mock).mockResolvedValue({ id: 'S-0001', role: 'student' });
    (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({ status: 'blocked' });
    await expect(
      UserServices.changeStatus('target', { status: 'blocked' }, { userId: 'A-0001', role: 'admin' }),
    ).resolves.toEqual({ status: 'blocked' });
  });
});

describe('faculty access to student profiles', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejects faculty who do not teach the student', async () => {
    (Faculty.findOne as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue({ _id: 'faculty-id' }) });
    (EnrolledCourse.exists as jest.Mock).mockResolvedValue(null);

    await expect(
      StudentServices.getSingleStudentFromDB('student-id', { userId: 'F-0001', role: 'faculty' }),
    ).rejects.toMatchObject({ statusCode: 403 });
    expect(Student.findOne).not.toHaveBeenCalled();
  });

  it('projects only academic identity for a faculty member teaching the student', async () => {
    (Faculty.findOne as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue({ _id: 'faculty-id' }) });
    (EnrolledCourse.exists as jest.Mock).mockResolvedValue({ _id: 'enrollment-id' });
    const query = { select: jest.fn().mockReturnThis(), populate: jest.fn().mockResolvedValue({ id: 'student-id' }) };
    (Student.findOne as jest.Mock).mockReturnValue(query);

    await StudentServices.getSingleStudentFromDB('student-id', { userId: 'F-0001', role: 'faculty' });

    expect(EnrolledCourse.exists).toHaveBeenCalledWith({ student: 'student-id', faculty: 'faculty-id', isEnrolled: true });
    expect(query.select).toHaveBeenCalledWith('id name academicDepartment academicFaculty');
  });
});
