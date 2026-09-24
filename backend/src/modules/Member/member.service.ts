import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { User } from '../User/user.model';
import { TMember } from './member.interface';
import { Member } from './member.model';

const getMemberQuery = (id: string) =>
  mongoose.isValidObjectId(id) ? { _id: id } : { id };

const getAllMembersFromDB = async (query: Record<string, unknown>) => {
  const memberQuery = new QueryBuilder(Member.find().populate('user'), query)
    .search(['name', 'email', 'contactNo'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await memberQuery.modelQuery;
  const meta = await memberQuery.countTotal();

  return {
    meta,
    result,
  };
};

const getSingleMemberFromDB = async (id: string) => {
  const result = await Member.findOne(getMemberQuery(id)).populate('user');
  return result;
};

const updateMemberIntoDB = async (id: string, payload: Partial<TMember>) => {
  const query = getMemberQuery(id);
  const isDeleted = await Member.findOne({ ...query, isDeleted: true });

  if (isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This member is deleted');
  }

  const result = await Member.findOneAndUpdate(query, payload, {
    returnDocument: 'after',
    runValidators: true,
  });

  return result;
};

const deleteMemberFromDB = async (id: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const query = getMemberQuery(id);
    const deletedMember = await Member.findOneAndUpdate(
      query,
      { isDeleted: true },
      { returnDocument: 'after', session },
    );

    if (!deletedMember) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete member');
    }

    const deletedUser = await User.findByIdAndUpdate(
      deletedMember.user,
      { isDeleted: true },
      { returnDocument: 'after', session },
    );

    if (!deletedUser) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete user');
    }

    await session.commitTransaction();
    await session.endSession();

    return deletedMember;
  } catch (err) {
    await session.abortTransaction();
    await session.endSession();
    throw err;
  }
};

export const MemberServices = {
  getAllMembersFromDB,
  getSingleMemberFromDB,
  updateMemberIntoDB,
  deleteMemberFromDB,
};
