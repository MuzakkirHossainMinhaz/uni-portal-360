import { Types } from 'mongoose';

export type TSemesterResult = {
  student: Types.ObjectId;
  academicSemester: Types.ObjectId;
  totalCredits: number;
  totalGradePoints: number;
  gpa: number;
  completedCourses: Types.ObjectId[];
};
