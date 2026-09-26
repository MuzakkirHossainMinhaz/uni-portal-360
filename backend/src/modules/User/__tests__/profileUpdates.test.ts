import mongoose from 'mongoose';
import { AdminServices } from '../../Admin/admin.service';
import { Admin } from '../../Admin/admin.model';
import { FacultyServices } from '../../Faculty/faculty.service';
import { Faculty } from '../../Faculty/faculty.model';
import { StudentServices } from '../../Student/student.service';
import { Student } from '../../Student/student.model';
import { AcademicDepartment } from '../../AcademicDepartment/academicDepartment.model';
import { User } from '../user.model';

jest.mock('../../Admin/admin.model', () => ({ Admin: { findById: jest.fn(), findByIdAndUpdate: jest.fn() } }));
jest.mock('../../Faculty/faculty.model', () => ({ Faculty: { findById: jest.fn(), findByIdAndUpdate: jest.fn() } }));
jest.mock('../../Student/student.model', () => ({ Student: { findById: jest.fn(), findByIdAndUpdate: jest.fn() } }));
jest.mock('../../AcademicDepartment/academicDepartment.model', () => ({
  AcademicDepartment: { findById: jest.fn() },
}));
jest.mock('../user.model', () => ({ User: { findByIdAndUpdate: jest.fn() } }));

describe('profile updates keep linked accounts consistent', () => {
  const session = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(mongoose, 'startSession').mockResolvedValue(session as never);
    (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({ email: 'new@example.com' });
  });

  afterEach(() => jest.restoreAllMocks());

  const currentProfile = { user: 'account-id', email: 'old@example.com' };
  const currentQuery = () => ({ session: jest.fn().mockResolvedValue(currentProfile) });

  it('updates the admin account email in the same transaction', async () => {
    (Admin.findById as jest.Mock).mockReturnValue(currentQuery());
    (Admin.findByIdAndUpdate as jest.Mock).mockResolvedValue({ email: 'new@example.com' });

    await AdminServices.updateAdminIntoDB('admin-id', { email: 'new@example.com' });

    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      'account-id',
      { email: 'new@example.com' },
      expect.objectContaining({ session }),
    );
    expect(Admin.findByIdAndUpdate).toHaveBeenCalledWith(
      'admin-id',
      { email: 'new@example.com' },
      expect.objectContaining({ session }),
    );
    expect(session.commitTransaction).toHaveBeenCalled();
  });

  it('derives faculty affiliation from the new department and updates account email', async () => {
    (Faculty.findById as jest.Mock).mockReturnValue(currentQuery());
    (AcademicDepartment.findById as jest.Mock).mockReturnValue({
      session: jest.fn().mockResolvedValue({ academicFaculty: 'faculty-id' }),
    });
    (Faculty.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

    await FacultyServices.updateFacultyIntoDB('profile-id', {
      email: 'new@example.com',
      academicDepartment: 'department-id' as never,
    });

    expect(Faculty.findByIdAndUpdate).toHaveBeenCalledWith(
      'profile-id',
      expect.objectContaining({ academicFaculty: 'faculty-id', email: 'new@example.com' }),
      expect.objectContaining({ session }),
    );
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith('account-id', { email: 'new@example.com' }, expect.anything());
  });

  it('derives student affiliation from the new department and updates account email', async () => {
    (Student.findById as jest.Mock).mockReturnValue(currentQuery());
    (AcademicDepartment.findById as jest.Mock).mockReturnValue({
      session: jest.fn().mockResolvedValue({ academicFaculty: 'faculty-id' }),
    });
    (Student.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

    await StudentServices.updateStudentIntoDB('profile-id', {
      email: 'new@example.com',
      academicDepartment: 'department-id' as never,
    });

    expect(Student.findByIdAndUpdate).toHaveBeenCalledWith(
      'profile-id',
      expect.objectContaining({ academicFaculty: 'faculty-id', email: 'new@example.com' }),
      expect.objectContaining({ session }),
    );
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith('account-id', { email: 'new@example.com' }, expect.anything());
  });

  it('rolls back when the linked account email cannot be updated', async () => {
    (Admin.findById as jest.Mock).mockReturnValue(currentQuery());
    (User.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error('duplicate email'));

    await expect(AdminServices.updateAdminIntoDB('admin-id', { email: 'new@example.com' })).rejects.toThrow();
    expect(Admin.findByIdAndUpdate).not.toHaveBeenCalled();
    expect(session.abortTransaction).toHaveBeenCalled();
  });
});
