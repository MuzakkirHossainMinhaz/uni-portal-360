import httpStatus from 'http-status';
import mongoose, { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import EnrolledCourse from '../EnrolledCourse/enrolledCourse.model';
import { Attendance } from './attendance.model';
import { requireFacultyCourse, requireStudent } from '../../utils/academicAccess';
import QueryBuilder from '../../builder/QueryBuilder';
import type { TAttendance } from './attendance.interface';
import { AttendanceRepository } from './attendance.repository';
import { SemesterRegistration } from '../SemesterRegistration/semesterRegistration.model';

const attendanceRepository = new AttendanceRepository();

const createAttendance = async (
  payload: {
    offeredCourse: string;
    date: string;
    attendanceList: { student: string; status: 'Present' | 'Absent' | 'Late'; remark?: string }[];
  },
  facultyId: string,
) => {
  const { offeredCourse, date, attendanceList } = payload;

  // 1. Verify OfferedCourse exists and belongs to the faculty
  const isOfferedCourseExists = await requireFacultyCourse(facultyId, offeredCourse);

  if (!isOfferedCourseExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Offered Course not found or does not belong to the faculty');
  }
  const attendanceDate = new Date(date);
  if (Number.isNaN(attendanceDate.getTime()) || attendanceDate > new Date()) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Attendance date must be a valid past or current date');
  }
  const registration = await SemesterRegistration.findById(isOfferedCourseExists.semesterRegistration).select('status');
  if (!registration || registration.status === 'ENDED') {
    throw new AppError(httpStatus.CONFLICT, 'Attendance is closed for this semester');
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const attendanceRecords: TAttendance[] = [];

    const enrolledStudents = await EnrolledCourse.find({ offeredCourse, isEnrolled: true })
      .select('student')
      .session(session);
    const enrolledIds = new Set(enrolledStudents.map((item) => String(item.student)));
    for (const record of attendanceList) {
      // 2. Verify Student is enrolled in this OfferedCourse
      const isStudentEnrolled = enrolledIds.has(record.student);

      if (!isStudentEnrolled) {
        throw new AppError(httpStatus.BAD_REQUEST, `Student ${record.student} is not enrolled in this course`);
      }

      // 3. Prepare Attendance Record
      attendanceRecords.push({
        student: new Types.ObjectId(record.student),
        offeredCourse: new Types.ObjectId(offeredCourse),
        semesterRegistration: isOfferedCourseExists.semesterRegistration as Types.ObjectId,
        date: new Date(date),
        status: record.status,
        remark: record.remark,
      } as TAttendance);
    }

    const studentIds = attendanceList.map((a) => a.student);
    const dateObj = new Date(date);

    await attendanceRepository.deleteMany(
      {
        offeredCourse: new Types.ObjectId(offeredCourse),
        date: dateObj,
        student: { $in: studentIds.map((id) => new Types.ObjectId(id)) },
      },
      { session },
    );

    const result = await attendanceRepository.insertMany(attendanceRecords, { session });

    await session.commitTransaction();
    await session.endSession();

    return result;
  } catch (err) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(
      httpStatus.BAD_REQUEST,
      err instanceof Error ? err.message : 'Failed to create attendance records',
    );
  }
};

const getStudentAttendance = async (studentId: string, query: Record<string, unknown>) => {
  const student = await requireStudent(studentId);
  const qb = new QueryBuilder(
    Attendance.find({ student: student._id }).populate({
      path: 'offeredCourse',
      populate: { path: 'course', select: 'title' },
    }),
    query,
  )
    .filter()
    .sort()
    .paginate();
  return { meta: await qb.countTotal(), data: await qb.modelQuery };
};

const getFacultyAttendanceSheet = async (userId: string, offeredCourse: string, date: string) => {
  await requireFacultyCourse(userId, offeredCourse);
  const [enrollments, records] = await Promise.all([
    EnrolledCourse.find({ offeredCourse, isEnrolled: true }).populate('student', 'id name').sort('student'),
    Attendance.find({ offeredCourse, date: new Date(date) }),
  ]);
  const byStudent = new Map(records.map((record) => [String(record.student), record]));
  return enrollments
    .map((enrollment) => {
      const student = enrollment.student as unknown as {
        _id: Types.ObjectId;
        id: string;
        name: { firstName: string; middleName?: string; lastName: string };
      } | null;
      if (!student) return null;
      const record = byStudent.get(String(student._id));
      return {
        student: student._id,
        id: student.id,
        name: [student.name.firstName, student.name.middleName, student.name.lastName].filter(Boolean).join(' '),
        status: record?.status ?? null,
        remark: record?.remark ?? '',
      };
    })
    .filter(Boolean);
};

const getAttendanceReport = async (query: Record<string, unknown>) => {
  const { meta, data } = await attendanceRepository.findAll(query);
  return { meta, data: data };
};

const getLowAttendanceStudents = async (threshold: number = 75) => {
  if (!Number.isFinite(threshold) || threshold < 0 || threshold > 100) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Threshold must be between 0 and 100');
  }
  // Aggregate to calculate attendance percentage per student per course
  const lowAttendanceList = await attendanceRepository.aggregate([
    {
      $group: {
        _id: { student: '$student', offeredCourse: '$offeredCourse' },
        totalClasses: { $sum: 1 },
        presentCount: {
          $sum: {
            $cond: [{ $in: ['$status', ['Present', 'Late']] }, 1, 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        student: '$_id.student',
        offeredCourse: '$_id.offeredCourse',
        totalClasses: 1,
        presentCount: 1,
        percentage: {
          $multiply: [{ $divide: ['$presentCount', '$totalClasses'] }, 100],
        },
      },
    },
    {
      $match: {
        percentage: { $lt: threshold },
      },
    },
    {
      $lookup: {
        from: 'students',
        localField: 'student',
        foreignField: '_id',
        as: 'studentDetails',
      },
    },
    {
      $unwind: '$studentDetails',
    },
    {
      $lookup: {
        from: 'offeredcourses',
        localField: 'offeredCourse',
        foreignField: '_id',
        as: 'courseDetails',
      },
    },
    {
      $unwind: '$courseDetails',
    },
    {
      $lookup: { from: 'courses', localField: 'courseDetails.course', foreignField: '_id', as: 'courseDetails.course' },
    },
    { $unwind: '$courseDetails.course' },
    {
      $project: {
        student: 1,
        offeredCourse: 1,
        totalClasses: 1,
        presentCount: 1,
        percentage: 1,
        'courseDetails.course.title': 1,
        'studentDetails.id': 1,
        'studentDetails.fullName': {
          $trim: {
            input: {
              $concat: [
                '$studentDetails.name.firstName',
                ' ',
                { $ifNull: ['$studentDetails.name.middleName', ''] },
                ' ',
                '$studentDetails.name.lastName',
              ],
            },
          },
        },
      },
    },
  ]);

  return lowAttendanceList;
};

const getAttendanceAnalytics = async () => {
  const totalAttendance = await attendanceRepository.countDocuments();

  const statusBreakdown = await attendanceRepository.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  return {
    totalAttendance,
    statusBreakdown,
  };
};

export const AttendanceServices = {
  getFacultyAttendanceSheet,
  createAttendance,
  getStudentAttendance,
  getAttendanceReport,
  getLowAttendanceStudents,
  getAttendanceAnalytics,
};
