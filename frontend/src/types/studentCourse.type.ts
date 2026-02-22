import type { TCourse } from './courseManagement.type';

type TOfferedCourseEnrolledCourse = {
  _id: string;
  course: string;
};

export type TOfferedCourse = {
  _id: string;
  semesterRegistration: string;
  academicSemester: string;
  academicFaculty: string;
  academicDepartment: string;
  course: TCourse;
  faculty: string;
  maxCapacity: number;
  section: number;
  days: string[];
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  enrolledCourses: TOfferedCourseEnrolledCourse[];
  completedCourses: TOfferedCourseEnrolledCourse[];
  completedCourseIds: string[];
  isPreRequisitesFulFilled: boolean;
  isAlreadyEnrolled: boolean;
};

export type TStudentEnrolledCourseSchedule = {
  _id: string;
  course: {
    title: string;
  };
  offeredCourse: {
    section: number;
    days: string[];
  };
};
