import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { User } from '../User/user.model';
import { AdminSearchableFields } from './admin.constant';
import { TAdmin } from './admin.interface';
import { Admin } from './admin.model';

const getAllAdminsFromDB = async (query: Record<string, unknown>) => {
  const adminQuery = new QueryBuilder(Admin.find(), { sort: '-_id', ...query })
    .search(AdminSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  adminQuery.modelQuery.find({ isDeleted: { $ne: true } });

  const result = await adminQuery.modelQuery;
  const meta = await adminQuery.countTotal();
  return {
    result,
    meta,
  };
};

const getSingleAdminFromDB = async (id: string) => {
  const result = await Admin.findById(id);
  return result;
};

const updateAdminIntoDB = async (id: string, payload: Partial<TAdmin>) => {
  const { name, ...remainingAdminData } = payload;

  const modifiedUpdatedData: Record<string, unknown> = {
    ...remainingAdminData,
  };

  if (name && Object.keys(name).length) {
    for (const [key, value] of Object.entries(name)) {
      modifiedUpdatedData[`name.${key}`] = value;
    }
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const currentAdmin = await Admin.findById(id).session(session);
    if (!currentAdmin) throw new AppError(httpStatus.NOT_FOUND, 'Admin not found');

    if (payload.email) {
      const account = await User.findByIdAndUpdate(
        currentAdmin.user,
        { email: payload.email },
        { session, runValidators: true, returnDocument: 'after' },
      );
      if (!account) throw new AppError(httpStatus.NOT_FOUND, 'Admin account not found');
    }

    const result = await Admin.findByIdAndUpdate(id, modifiedUpdatedData, {
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

const deleteAdminFromDB = async (id: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const deletedAdmin = await Admin.findByIdAndUpdate(id, { isDeleted: true }, { returnDocument: 'after', session });

    if (!deletedAdmin) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete admin');
    }

    // get user _id from deletedAdmin
    const userId = deletedAdmin.user;

    const deletedUser = await User.findByIdAndUpdate(userId, { isDeleted: true }, { returnDocument: 'after', session });

    if (!deletedUser) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete user');
    }

    await session.commitTransaction();
    return deletedAdmin;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export const AdminServices = {
  getAllAdminsFromDB,
  getSingleAdminFromDB,
  updateAdminIntoDB,
  deleteAdminFromDB,
};
