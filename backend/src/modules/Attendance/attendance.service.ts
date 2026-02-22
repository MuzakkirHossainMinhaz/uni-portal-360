import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
import EnrolledCourse from '../EnrolledCourse/enrolledCourse.model';
import { OfferedCourse } from '../OfferedCourse/OfferedCourse.model';
import { TAttendance } from './attendance.interface';
import { AttendanceRepository } from './attendance.repository';

const attendanceRepository = new AttendanceRepository();

const createAttendanceIntoDB = async (payload: {
  offeredCourse: string;
  date: string;
  attendanceList: { student: string; status: 'Present' | 'Absent' | 'Late'; remark?: string }[];
}, facultyId: string) => {
  const { offeredCourse, date, attendanceList } = payload;

  // 1. Verify OfferedCourse exists and belongs to the faculty
  const isOfferedCourseExists = await OfferedCourse.findOne({
    _id: offeredCourse,
    faculty: facultyId,
  });

  if (!isOfferedCourseExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Offered Course not found or does not belong to the faculty');
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const attendanceRecords: TAttendance[] = [];

    for (const record of attendanceList) {
      // 2. Verify Student is enrolled in this OfferedCourse
      const isStudentEnrolled = await EnrolledCourse.findOne({
        offeredCourse,
        student: record.student,
        isEnrolled: true,
      });

      if (!isStudentEnrolled) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Student ${record.student} is not enrolled in this course`,
        );
      }

      // 3. Prepare Attendance Record
      attendanceRecords.push({
        student: record.student,
        offeredCourse,
        semesterRegistration: isOfferedCourseExists.semesterRegistration.toString(),
        date: new Date(date),
        status: record.status,
        remark: record.remark,
      });
    }

    const studentIds = attendanceList.map((a) => a.student);
    const dateObj = new Date(date);

    await attendanceRepository.model.deleteMany(
      {
        offeredCourse,
        date: dateObj,
        student: { $in: studentIds },
      },
      { session },
    );

    const result = await attendanceRepository.model.insertMany(attendanceRecords, { session });

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
  // Add studentId to query to enforce security
  const secureQuery = { ...query, student: studentId };
  const { meta, data } = await attendanceRepository.findAll(secureQuery);
  return { meta, result: data };
};

const getAttendanceReport = async (query: Record<string, unknown>) => {
  const { meta, data } = await attendanceRepository.findAll(query);
  return { meta, result: data };
};

const getLowAttendanceStudents = async (threshold: number = 75) => {
  // Aggregate to calculate attendance percentage per student per course
  const lowAttendanceList = await attendanceRepository.model.aggregate([
    {
      $group: {
        _id: { student: '$student', offeredCourse: '$offeredCourse' },
        totalClasses: { $sum: 1 },
        presentCount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Present'] }, 1, 0],
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
            as: 'courseDetails'
        }
    },
    {
        $unwind: '$courseDetails'
    }
  ]);

  return lowAttendanceList;
};

const getAttendanceAnalytics = async () => {
    const totalAttendance = await attendanceRepository.model.countDocuments();
    
    const statusBreakdown = await attendanceRepository.model.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    return {
        totalAttendance,
        statusBreakdown
    };
}

export const AttendanceServices = {
  createAttendanceIntoDB,
  getStudentAttendance,
  getAttendanceReport,
  getLowAttendanceStudents,
  getAttendanceAnalytics
};

