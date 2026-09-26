import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { User } from '../User/user.model';
import { AcademicDepartment } from '../AcademicDepartment/academicDepartment.model';
import EnrolledCourse from '../EnrolledCourse/enrolledCourse.model';
import { Faculty } from '../Faculty/faculty.model';
import { studentSearchableFields } from './student.constant';
import { TStudent } from './student.interface';
import { Student } from './student.model';

const getAllStudentsFromDB = async (query: Record<string, unknown>) => {
  const studentQuery = new QueryBuilder(
    Student.find()
      .populate('user')
      .populate('admissionSemester')
      .populate('academicDepartment academicFaculty'),
    { sort: '-_id', ...query },
  )
    .search(studentSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  studentQuery.modelQuery.find({ isDeleted: { $ne: true } });

  const meta = await studentQuery.countTotal();
  const result = await studentQuery.modelQuery;

  return {
    meta,
    result,
  };
};

const getSingleStudentFromDB = async (id: string, requester?: { userId: string; role: string }) => {
  if (requester?.role === 'faculty') {
    const faculty = await Faculty.findOne({ id: requester.userId, isDeleted: { $ne: true } }).select('_id');
    const teachesStudent = faculty && await EnrolledCourse.exists({ student: id, faculty: faculty._id, isEnrolled: true });
    if (!teachesStudent) throw new AppError(httpStatus.FORBIDDEN, 'You cannot view this student');

    // Faculty only need identity and academic placement, not guardian/contact details.
    return Student.findOne({ _id: id, isDeleted: { $ne: true } })
      .select('id name academicDepartment academicFaculty')
      .populate('academicDepartment academicFaculty');
  }

  const result = await Student.findById(id)
    .populate('admissionSemester')
    .populate('academicDepartment academicFaculty');
  return result;
};

const updateStudentIntoDB = async (id: string, payload: Partial<TStudent>) => {
  const { name, guardian, localGuardian, ...remainingStudentData } = payload;

  const modifiedUpdatedData: Record<string, unknown> = {
    ...remainingStudentData,
  };

  if (name && Object.keys(name).length) {
    for (const [key, value] of Object.entries(name)) {
      modifiedUpdatedData[`name.${key}`] = value;
    }
  }

  if (guardian && Object.keys(guardian).length) {
    for (const [key, value] of Object.entries(guardian)) {
      modifiedUpdatedData[`guardian.${key}`] = value;
    }
  }

  if (localGuardian && Object.keys(localGuardian).length) {
    for (const [key, value] of Object.entries(localGuardian)) {
      modifiedUpdatedData[`localGuardian.${key}`] = value;
    }
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const currentStudent = await Student.findById(id).session(session);
    if (!currentStudent) throw new AppError(httpStatus.NOT_FOUND, 'Student not found');

    if (payload.academicDepartment) {
      const department = await AcademicDepartment.findById(payload.academicDepartment).session(session);
      if (!department) throw new AppError(httpStatus.BAD_REQUEST, 'Academic department not found');
      modifiedUpdatedData.academicFaculty = department.academicFaculty;
    }

    if (payload.email) {
      const account = await User.findByIdAndUpdate(
        currentStudent.user,
        { email: payload.email },
        { session, runValidators: true, returnDocument: 'after' },
      );
      if (!account) throw new AppError(httpStatus.NOT_FOUND, 'Student account not found');
    }

    const result = await Student.findByIdAndUpdate(id, modifiedUpdatedData, {
      session,
      returnDocument: 'after',
      runValidators: true,
    });
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

const deleteStudentFromDB = async (id: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const deletedStudent = await Student.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { returnDocument: 'after', session },
    );

    if (!deletedStudent) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete student');
    }

    // get user _id from deletedStudent
    const userId = deletedStudent.user;

    const deletedUser = await User.findByIdAndUpdate(userId, { isDeleted: true }, { returnDocument: 'after', session });

    if (!deletedUser) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete user');
    }

    await session.commitTransaction();
    return deletedStudent;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export const StudentServices = {
  getAllStudentsFromDB,
  getSingleStudentFromDB,
  updateStudentIntoDB,
  deleteStudentFromDB,
};
