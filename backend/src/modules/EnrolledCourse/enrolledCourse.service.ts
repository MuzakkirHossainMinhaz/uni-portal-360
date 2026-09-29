import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { Course } from '../Course/course.model';
import { Faculty } from '../Faculty/faculty.model';
import { OfferedCourse } from '../OfferedCourse/offeredCourse.model';
import { SemesterRegistration } from '../SemesterRegistration/semesterRegistration.model';
import { Student } from '../Student/student.model';
import { User } from '../User/user.model';
import { AuditLog } from '../AuditLog/auditLog.model';
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
      const now = new Date();
      if (
        !registration ||
        registration.status !== 'ONGOING' ||
        now < registration.startDate ||
        now > registration.endDate
      )
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
            courseSnapshot: { title: course.title, prefix: course.prefix, code: course.code, credits: course.credits },
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
    })
      .populate('semesterRegistration academicSemester academicFaculty academicDepartment offeredCourse course')
      .populate({
        path: 'student',
        select: 'id name academicDepartment academicFaculty',
        options: { includeDeleted: true },
      })
      .populate({
        path: 'faculty',
        select: 'id name designation academicDepartment academicFaculty',
        options: { includeDeleted: true },
      }),
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

  const currentRegistrations =
    query.current === 'true' ? await SemesterRegistration.find({ status: 'ONGOING' }).select('_id') : [];
  const { current: _current, ...filters } = query;
  const enrolledCourseQuery = new QueryBuilder(
    EnrolledCourse.find({
      student: student._id,
      ...(query.current === 'true'
        ? { semesterRegistration: { $in: currentRegistrations.map((item) => item._id) } }
        : {}),
    })
      .populate('semesterRegistration academicSemester academicFaculty academicDepartment offeredCourse course')
      .populate({
        path: 'student',
        select: 'id name academicDepartment academicFaculty',
        options: { includeDeleted: true },
      })
      .populate({
        path: 'faculty',
        select: 'id name designation academicDepartment academicFaculty',
        options: { includeDeleted: true },
      }),
    filters,
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

const getAdminEnrolledCourses = async (query: Record<string, unknown>) => {
  const { studentId, ...filters } = query;
  const student = studentId ? await Student.findOne({ id: String(studentId) }).select('_id') : null;
  const qb = new QueryBuilder(
    EnrolledCourse.find({
      isCompleted: true,
      ...(studentId ? { student: student?._id ?? null } : {}),
    })
      .populate('semesterRegistration academicSemester offeredCourse course')
      .populate({ path: 'student', select: 'id name', options: { includeDeleted: true } })
      .populate({ path: 'faculty', select: 'id name', options: { includeDeleted: true } }),
    filters,
  )
    .sort()
    .paginate();
  return { data: await qb.modelQuery, meta: await qb.countTotal() };
};

type MarksUpdate = Pick<TEnrolledCourse, 'semesterRegistration' | 'offeredCourse' | 'student'> & {
  courseMarks?: Partial<Record<keyof TEnrolledCourse['courseMarks'], number>>;
  publish?: boolean;
  correctionReason?: string;
};

const markKeys = ['classTest1', 'midTerm', 'classTest2', 'finalTerm'] as const;

const updateEnrolledCourseMarks = async (facultyId: string, payload: MarksUpdate, role = 'faculty') => {
  const { semesterRegistration, offeredCourse, student, courseMarks, publish, correctionReason } = payload;
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
      if (enrollment.isCompleted && role === 'faculty') {
        throw new AppError(httpStatus.CONFLICT, 'Published marks are locked; request an Admin correction');
      }
      if (enrollment.isCompleted && (!correctionReason || correctionReason.trim().length < 10)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'A correction reason is required for published marks');
      }
      // Serialize grading for a student, including GPA changes in other courses.
      const profile = await Student.findOneAndUpdate(
        { _id: student, isDeleted: { $ne: true } },
        { $inc: { __v: 1 } },
        { session },
      );
      if (!profile) throw new AppError(httpStatus.NOT_FOUND, 'Student not found');
      const changes: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(courseMarks ?? {})) changes[`courseMarks.${key}`] = value;
      const enteredMarks = [...new Set([...(enrollment.enteredMarks ?? []), ...Object.keys(courseMarks ?? {})])];
      changes.enteredMarks = enteredMarks;
      const shouldPublish = publish === true || enrollment.isCompleted;
      if (shouldPublish) {
        if (!enrollment.isCompleted && markKeys.some((key) => !enteredMarks.includes(key))) {
          throw new AppError(httpStatus.BAD_REQUEST, 'Enter all four marks before publishing');
        }
        const marks = Object.fromEntries(
          markKeys.map((key) => [key, courseMarks?.[key] ?? enrollment.courseMarks[key]]),
        ) as Record<(typeof markKeys)[number], number | null>;
        if (markKeys.some((key) => marks[key] === null || marks[key] === undefined)) {
          throw new AppError(httpStatus.BAD_REQUEST, 'All marks must be numeric');
        }
        const totalMarks =
          Math.ceil(marks.classTest1 as number) +
          Math.ceil(marks.midTerm as number) +
          Math.ceil(marks.classTest2 as number) +
          Math.ceil(marks.finalTerm as number);
        Object.assign(changes, calculateGradeAndPoints(totalMarks), { isCompleted: true });
        if (!enrollment.isCompleted) changes.publishedAt = new Date();
      }
      const correction = enrollment.isCompleted
        ? {
            approvedBy: facultyId,
            reason: correctionReason!.trim(),
            previousMarks: Object.fromEntries(markKeys.map((key) => [key, enrollment.courseMarks[key]])),
            newMarks: Object.fromEntries(
              markKeys.map((key) => [key, courseMarks?.[key] ?? enrollment.courseMarks[key]]),
            ),
            previousGrade: enrollment.grade,
            newGrade: changes.grade ?? enrollment.grade,
            correctedAt: new Date(),
          }
        : null;
      const result = await EnrolledCourse.findByIdAndUpdate(
        enrollment._id,
        {
          $set: changes,
          ...(correction ? { $push: { gradeCorrections: correction } } : {}),
        },
        {
          session,
          returnDocument: 'after',
          runValidators: true,
        },
      );
      const semesterResult = shouldPublish
        ? await SemesterResultServices.calculateSemesterGPA(
            String(student),
            String(enrollment.academicSemester),
            session,
          )
        : null;
      if (shouldPublish) {
        const actor = await User.findOne({ id: facultyId }).select('_id').session(session);
        if (!actor) throw new AppError(httpStatus.UNAUTHORIZED, 'Grading actor no longer exists');
        await AuditLog.create(
          [
            {
              userId: actor._id,
              action: enrollment.isCompleted ? 'CORRECT_RESULT' : 'PUBLISH_RESULT',
              entityType: 'enrolled-courses',
              entityId: String(enrollment._id),
              oldValues: {
                marks: Object.fromEntries(markKeys.map((key) => [key, enrollment.courseMarks[key]])),
                grade: enrollment.grade,
              },
              newValues: {
                marks: Object.fromEntries(
                  markKeys.map((key) => [key, courseMarks?.[key] ?? enrollment.courseMarks[key]]),
                ),
                grade: result?.grade,
              },
              severity: 'HIGH',
              status: 'SUCCESS',
              metadata: { reason: correctionReason?.trim() ?? null },
            },
          ],
          { session },
        );
      }
      return { result, gpa: semesterResult?.gpa };
    });
    return saved.result;
  } finally {
    await session.endSession();
  }
};
export const EnrolledCourseServices = {
  createEnrolledCourse,
  getAllEnrolledCourses,
  getMyEnrolledCourses,
  getAdminEnrolledCourses,
  updateEnrolledCourseMarks,
};
