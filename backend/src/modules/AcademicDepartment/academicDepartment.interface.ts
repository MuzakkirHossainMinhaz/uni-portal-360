import { Types } from 'mongoose';

export type TAcademicDepartment = {
  name: string;
  description?: string;
  academicFaculty: Types.ObjectId;
};
