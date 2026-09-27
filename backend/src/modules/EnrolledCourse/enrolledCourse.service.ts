import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { Course } from '../Course/course.model';
import { Faculty } from '../Faculty/faculty.model';
import { OfferedCourse } from '../OfferedCourse/offeredCourse.model';
import { SemesterRegistration } from '../SemesterRegistration/semesterRegistration.model';
import { Student } from '../Student/student.model';
import type { TEnrolledCourse } from './enrolledCourse.interface';
import EnrolledCourse from './enrolledCourse.model';
import { hasTimeConflict } from '../OfferedCourse/offeredCourse.utils';
import { calculateGradeAndPoints } from './enrolledCourse.utils';

const createEnrolledCourse = async (userId: string, payload: TEnrolledCourse) => {
  const session = await mongoose.startSession();
  try {
    return await session.withTransaction(async () => {
      // Serialize registrations for one student so concurrent requests cannot exceed the credit limit.
      const student = await Student.findOneAndUpdate(
        { id: userId, isDeleted: false },
        { $inc: { __v: 1 } },
        { session, returnDocument: 'after' },
      );
      if (!student) throw new AppError(httpStatus.NOT_FOUND, 'Student not found');
      const offering = await OfferedCourse.findById(payload.offeredCourse).session(session);
      if (!offering) throw new AppError(httpStatus.NOT_FOUND, 'Offered course not found');
      const registration = await SemesterRegistration.findById(offering.semesterRegistration).session(session);
      if (!registration || registration.status !== 'ONGOING')
        throw new AppError(httpStatus.BAD_REQUEST, 'Registration is not open');
      if (
        String(student.academicDepartment) !== String(offering.academicDepartment) ||
        String(student.academicFaculty) !== String(offering.academicFaculty)
      ) {
        throw new AppError(httpStatus.FORBIDDEN, 'This course is not offered to your department');
      }
      const course = await Course.findById(offering.course).session(session);
      if (!course || course.isDeleted) throw new AppError(httpStatus.NOT_FOUND, 'Course not found');
      const enrollments = await EnrolledCourse.find({
        student: student._id,
        semesterRegistration: registration._id,
        isEnrolled: true,
      }).session(session);
      if (enrollments.some((item) => String(item.course) === String(course._id)))
        throw new AppError(httpStatus.CONFLICT, 'You are already enrolled in this course');
      const enrolledCourses = await Course.find({ _id: { $in: enrollments.map((item) => item.course) } }).session(
        session,
      );
      const credits = enrolledCourses.reduce((sum, item) => sum + item.credits, 0);
      if (credits + course.credits > registration.maxCredit)
        throw new AppError(httpStatus.BAD_REQUEST, 'Maximum semester credits exceeded');
      const prerequisites = course.preRequisiteCourses
        .filter((item) => !item.isDeleted)
        .map((item) => String(item.course));
      if (prerequisites.length) {
        const completed = await EnrolledCourse.find({
          student: student._id,
          course: { $in: prerequisites },
          isCompleted: true,
          gradePoints: { $gt: 0 },
        }).session(session);
        const passed = new Set(completed.map((item) => String(item.course)));
        if (prerequisites.some((id) => !passed.has(id)))
          throw new AppError(httpStatus.BAD_REQUEST, 'Complete the prerequisite courses first');
      }
      const schedules = await OfferedCourse.find({
        _id: { $in: enrollments.map((item) => item.offeredCourse) },
      }).session(session);
      if (hasTimeConflict(schedules, offering))
        throw new AppError(httpStatus.CONFLICT, 'This course conflicts with your schedule');
      const reserved = await OfferedCourse.findOneAndUpdate(
        { _id: offering._id, maxCapacity: { $gt: 0 } },
        { $inc: { maxCapacity: -1 } },
        { session, returnDocument: 'after' },
      );
      if (!reserved) throw new AppError(httpStatus.CONFLICT, 'This section is full');
      return EnrolledCourse.create(
        [
          {
            semesterRegistration: offering.semesterRegistration,
            academicSemester: offering.academicSemester,
            academicFaculty: offering.academicFaculty,
            academicDepartment: offering.academicDepartment,
            offeredCourse: offering._id,
            course: offering.course,
            student: student._id,
            faculty: offering.faculty,
            isEnrolled: true,
          },
        ],
        { session },
      );
    });
  } finally {
    await session.endSession();
  }
};
const getAllEnrolledCourses = async (facultyId: string, query: Record<string, unknown>) => {
  const faculty = await Faculty.findOne({ id: facultyId });

  if (!faculty) {
    throw new AppError(httpStatus.NOT_FOUND, 'Faculty not found !');
  }

  const enrolledCourseQuery = new QueryBuilder(
    EnrolledCourse.find({
      faculty: faculty._id,
    }).populate(
      'semesterRegistration academicSemester academicFaculty academicDepartment offeredCourse course student faculty',
    ),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await enrolledCourseQuery.modelQuery;
  const meta = await enrolledCourseQuery.countTotal();

  return {
    meta,
    data: result,
  };
};

const getMyEnrolledCourses = async (studentId: string, query: Record<string, unknown>) => {
  const student = await Student.findOne({ id: studentId });

  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student not found !');
  }

  const enrolledCourseQuery = new QueryBuilder(
    EnrolledCourse.find({ student: student._id }).populate(
      'semesterRegistration academicSemester academicFaculty academicDepartment offeredCourse course student faculty',
    ),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await enrolledCourseQuery.modelQuery;
  const meta = await enrolledCourseQuery.countTotal();

  return {
    meta,
    data: result,
  };
};

const updateEnrolledCourseMarks = async (facultyId: string, payload: Partial<TEnrolledCourse>, role = 'faculty') => {
  const { semesterRegistration, offeredCourse, student, courseMarks } = payload;
  if (!['faculty', 'admin', 'superAdmin'].includes(role)) throw new AppError(httpStatus.FORBIDDEN, 'Access denied');
  const faculty = role === 'faculty' ? await Faculty.findOne({ id: facultyId }).select('_id') : null;
  if (role === 'faculty' && !faculty) throw new AppError(httpStatus.NOT_FOUND, 'Faculty not found');
  const { SemesterResultServices } = await import('../SemesterResult/semesterResult.service');
  const session = await mongoose.startSession();
  try {
    const saved = await session.withTransaction(async () => {
      const enrollment = await EnrolledCourse.findOne({
        semesterRegistration,
        offeredCourse,
        student,
        ...(faculty ? { faculty: faculty._id } : {}),
      }).session(session);
      if (!enrollment) throw new AppError(httpStatus.NOT_FOUND, 'Enrollment not found for this course');
      // Serialize grading for a student, including GPA changes in other courses.
      const profile = await Student.findOneAndUpdate(
        { _id: student, isDeleted: { $ne: true } },
        { $inc: { __v: 1 } },
        { session },
      );
      if (!profile) throw new AppError(httpStatus.NOT_FOUND, 'Student not found');
      const changes: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(courseMarks ?? {})) changes[`courseMarks.${key}`] = value;
      const publish = courseMarks?.finalTerm !== undefined || enrollment.isCompleted;
      if (publish) {
        const marks = { ...enrollment.courseMarks, ...courseMarks };
        const totalMarks =
          Math.ceil(marks.classTest1) +
          Math.ceil(marks.midTerm) +
          Math.ceil(marks.classTest2) +
          Math.ceil(marks.finalTerm);
        Object.assign(changes, calculateGradeAndPoints(totalMarks), { isCompleted: true });
      }
      const result = await EnrolledCourse.findByIdAndUpdate(enrollment._id, changes, {
        session,
        returnDocument: 'after',
        runValidators: true,
      });
      const semesterResult = publish
        ? await SemesterResultServices.calculateSemesterGPA(
            String(student),
            String(enrollment.academicSemester),
            session,
          )
        : null;
      return { result, gpa: semesterResult?.gpa };
    });
    if (saved.gpa !== undefined) await SemesterResultServices.notifyResultPublished(String(student), saved.gpa);
    return saved.result;
  } finally {
    await session.endSession();
  }
};
export const EnrolledCourseServices = {
  createEnrolledCourse,
  getAllEnrolledCourses,
  getMyEnrolledCourses,
  updateEnrolledCourseMarks,
};
