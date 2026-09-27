import httpStatus from 'http-status';
import AppError from '../errors/AppError';
import { Faculty } from '../modules/Faculty/faculty.model';
import { Student } from '../modules/Student/student.model';
import { OfferedCourse } from '../modules/OfferedCourse/offeredCourse.model';

export type AcademicActor = { userId: string; role: string };

export const requireFaculty = async (userId: string) => {
  const faculty = await Faculty.findOne({ id: userId }).select('_id');
  if (!faculty) throw new AppError(httpStatus.NOT_FOUND, 'Faculty not found');
  return faculty;
};

export const requireStudent = async (userId: string) => {
  const student = await Student.findOne({ id: userId }).select('_id');
  if (!student) throw new AppError(httpStatus.NOT_FOUND, 'Student not found');
  return student;
};

export const requireFacultyCourse = async (userId: string, courseId: string) => {
  const faculty = await requireFaculty(userId);
  const course = await OfferedCourse.findOne({ _id: courseId, faculty: faculty._id });
  if (!course) throw new AppError(httpStatus.NOT_FOUND, 'Course not found for this faculty');
  return course;
};
