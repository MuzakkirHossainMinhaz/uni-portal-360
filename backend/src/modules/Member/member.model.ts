import { Schema, model } from 'mongoose';
import { MemberModel, TMember } from './member.interface';

const memberSchema = new Schema<TMember, MemberModel>(
  {
    id: {
      type: String,
      required: [true, 'ID is required'],
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      required: [true, 'User id is required'],
      unique: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
    },
    contactNo: {
      type: String,
      required: [true, 'Contact number is required'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    membershipType: {
      type: String,
      default: 'standard',
    },
    profileImg: {
      type: String,
      default: '',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

memberSchema.statics.isUserExists = async function (id: string) {
  const existingUser = await Member.findOne({ id });
  return existingUser;
};

export const Member = model<TMember, MemberModel>('Member', memberSchema);
