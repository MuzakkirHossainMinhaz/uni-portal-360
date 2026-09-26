import { TAcademicSemester } from '.';

export type TSemester = {
  _id: string;
  academicSemester: TAcademicSemester;
  status: 'UPCOMING' | 'ONGOING' | 'ENDED';
  startDate: string;
  endDate: string;
  minCredit: number;
  maxCredit: number;
  createdAt: string;
  updatedAt: string;
};

export type TCourse = {
  _id: string;
  title: string;
  prefix: string;
  code: number;
  credits: number;
  preRequisiteCourses: { course: string | TCourse | null; isDeleted: boolean }[];
  isDeleted: boolean;
};

export type TCourseFaculty = {
  _id: string;
  course: string;
  faculties: {
    _id: string;
    fullName: string;
  }[];
};

export type TOfferedCourse = {
  _id: string;
  semesterRegistration: TSemester;
  academicSemester: TAcademicSemester;
  academicFaculty: { _id: string; name: string };
  academicDepartment: { _id: string; name: string };
  course: TCourse;
  faculty: { _id: string; id: string; name: { firstName: string; middleName?: string; lastName: string } };
  section: number;
  maxCapacity: number;
  days: string[];
  startTime: string;
  endTime: string;
};
