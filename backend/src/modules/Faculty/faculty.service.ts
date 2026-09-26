import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { User } from '../User/user.model';
import { AcademicDepartment } from '../AcademicDepartment/academicDepartment.model';
import { FacultySearchableFields } from './faculty.constant';
import { TFaculty } from './faculty.interface';
import { Faculty } from './faculty.model';

const getAllFacultiesFromDB = async (query: Record<string, unknown>) => {
  const facultyQuery = new QueryBuilder(Faculty.find().populate('academicDepartment academicFaculty'), {
    sort: '-_id',
    ...query,
  })
    .search(FacultySearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await facultyQuery.modelQuery;
  const meta = await facultyQuery.countTotal();
  return {
    meta,
    result,
  };
};

const getSingleFacultyFromDB = async (id: string) => {
  const result = await Faculty.findById(id).populate('academicDepartment academicFaculty');

  return result;
};

const updateFacultyIntoDB = async (id: string, payload: Partial<TFaculty>) => {
  const { name, ...remainingFacultyData } = payload;

  const modifiedUpdatedData: Record<string, unknown> = {
    ...remainingFacultyData,
  };

  if (name && Object.keys(name).length) {
    for (const [key, value] of Object.entries(name)) {
      modifiedUpdatedData[`name.${key}`] = value;
    }
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const currentFaculty = await Faculty.findById(id).session(session);
    if (!currentFaculty) throw new AppError(httpStatus.NOT_FOUND, 'Faculty not found');

    if (payload.academicDepartment) {
      const department = await AcademicDepartment.findById(payload.academicDepartment).session(session);
      if (!department) throw new AppError(httpStatus.BAD_REQUEST, 'Academic department not found');
      modifiedUpdatedData.academicFaculty = department.academicFaculty;
    }

    if (payload.email) {
      const account = await User.findByIdAndUpdate(
        currentFaculty.user,
        { email: payload.email },
        { session, runValidators: true, returnDocument: 'after' },
      );
      if (!account) throw new AppError(httpStatus.NOT_FOUND, 'Faculty account not found');
    }

    const result = await Faculty.findByIdAndUpdate(id, modifiedUpdatedData, {
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

const deleteFacultyFromDB = async (id: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const deletedFaculty = await Faculty.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { returnDocument: 'after', session },
    );

    if (!deletedFaculty) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete faculty');
    }

    // get user _id from deletedFaculty
    const userId = deletedFaculty.user;

    const deletedUser = await User.findByIdAndUpdate(userId, { isDeleted: true }, { returnDocument: 'after', session });

    if (!deletedUser) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete user');
    }

    await session.commitTransaction();
    await session.endSession();

    return deletedFaculty;
  } catch (err) {
    await session.abortTransaction();
    await session.endSession();
    throw err;
  }
};

export const FacultyServices = {
  getAllFacultiesFromDB,
  getSingleFacultyFromDB,
  updateFacultyIntoDB,
  deleteFacultyFromDB,
};
