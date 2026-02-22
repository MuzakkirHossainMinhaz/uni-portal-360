import { Types } from 'mongoose';

export type TAssignment = {
  title: string;
  offeredCourse: Types.ObjectId;
  description: string;
  deadline: Date;
  faculty: Types.ObjectId;
  isDeleted: boolean;
};
