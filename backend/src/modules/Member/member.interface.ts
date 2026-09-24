import { Model, Types } from 'mongoose';

export type TMember = {
  id: string;
  user: Types.ObjectId;
  name: string;
  email: string;
  contactNo: string;
  address: string;
  membershipType: string;
  profileImg?: string;
  isDeleted: boolean;
};

export interface MemberModel extends Model<TMember> {
  isUserExists(id: string): Promise<TMember | null>;
}
