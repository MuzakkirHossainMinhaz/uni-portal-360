import type { Types } from 'mongoose';

export type TGrade = 'A' | 'B' | 'C' | 'D' | 'F' | 'NA';

export type TEnrolledCourseMarks = {
  classTest1: number | null;
  midTerm: number | null;
  classTest2: number | null;
  finalTerm: number | null;
};

export type TEnrolledCourse = {
  semesterRegistration: Types.ObjectId;
  academicSemester: Types.ObjectId;
  academicFaculty: Types.ObjectId;
  academicDepartment: Types.ObjectId;
  offeredCourse: Types.ObjectId;
  course: Types.ObjectId;
  courseSnapshot?: { title: string; prefix: string; code: number; credits: number };
  student: Types.ObjectId;
  faculty: Types.ObjectId;
  isEnrolled: boolean;
  courseMarks: TEnrolledCourseMarks;
  grade: TGrade;
  gradePoints: number;
  isCompleted: boolean;
  enteredMarks: string[];
  publishedAt?: Date;
  gradeCorrections: {
    approvedBy: string;
    reason: string;
    previousMarks: TEnrolledCourseMarks;
    newMarks: TEnrolledCourseMarks;
    previousGrade: TGrade;
    newGrade: TGrade;
    correctedAt: Date;
  }[];
};
