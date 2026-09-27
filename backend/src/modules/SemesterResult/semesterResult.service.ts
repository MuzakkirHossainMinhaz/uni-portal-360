import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
import { logger } from '../../utils/logger';
import EnrolledCourse from '../EnrolledCourse/enrolledCourse.model';
import { NotificationServices } from '../Notification/notification.service';
import { Student } from '../Student/student.model';
import { SemesterResult } from './semesterResult.model';

const calculateSemesterGPA = async (
  studentId: string,
  academicSemesterId: string,
  externalSession?: mongoose.ClientSession,
) => {
  const session = externalSession ?? (await mongoose.startSession());
  let semesterResult;
  try {
    if (!externalSession) session.startTransaction();
    const enrolledCourses = await EnrolledCourse.find({
      student: studentId,
      academicSemester: academicSemesterId,
      isCompleted: true,
    })
      .session(session)
      .populate('course');
    if (!enrolledCourses.length)
      throw new AppError(httpStatus.NOT_FOUND, 'No completed courses found for this semester');

    let totalCredits = 0;
    let totalGradePoints = 0;
    const completedCourses = [];
    for (const enrollment of enrolledCourses) {
      const credits = (enrollment.course as { credits?: number } | null)?.credits;
      if (credits && credits > 0) {
        totalCredits += credits;
        totalGradePoints += credits * enrollment.gradePoints;
        completedCourses.push(enrollment._id);
      }
    }
    const gpa = totalCredits ? Number((totalGradePoints / totalCredits).toFixed(2)) : 0;
    semesterResult = await SemesterResult.findOneAndUpdate(
      { student: studentId, academicSemester: academicSemesterId },
      {
        student: studentId,
        academicSemester: academicSemesterId,
        totalCredits,
        totalGradePoints,
        gpa,
        completedCourses,
      },
      { upsert: true, returnDocument: 'after', session, runValidators: true },
    );
    const results = await SemesterResult.find({ student: studentId }).session(session);
    const credits = results.reduce((sum, result) => sum + result.totalCredits, 0);
    const points = results.reduce((sum, result) => sum + result.totalGradePoints, 0);
    const cgpa = credits ? Number((points / credits).toFixed(2)) : 0;
    await Student.findByIdAndUpdate(studentId, { cgpa }, { session });
    if (!externalSession) await session.commitTransaction();
  } catch (error) {
    if (!externalSession) await session.abortTransaction();
    throw error;
  } finally {
    if (!externalSession) await session.endSession();
  }

  if (!externalSession) await notifyResultPublished(studentId, semesterResult.gpa);
  return semesterResult;
};

const notifyResultPublished = async (studentId: string, gpa: number) => {
  // A notification failure must not turn a committed result into an API failure.
  try {
    const student = await Student.findById(studentId).select('user');
    if (student?.user)
      await NotificationServices.createNotification({
        userId: student.user,
        title: 'Results Published',
        message: `Your semester results have been updated. Your GPA is ${gpa}.`,
        type: 'RESULT_PUBLISHED',
        priority: 'HIGH',
        read: false,
        isDeleted: false,
        actionUrl: '/student/results',
      });
  } catch (error) {
    logger.error('Results saved, but notification failed', error);
  }
};

const getMySemesterResults = async (userId: string, _query: Record<string, unknown>) => {
  const student = await Student.findOne({ id: userId }).select('_id');
  if (!student) throw new AppError(httpStatus.NOT_FOUND, 'Student not found');
  return SemesterResult.find({ student: student._id }).populate('academicSemester').sort({ createdAt: -1 });
};

export const SemesterResultServices = { calculateSemesterGPA, getMySemesterResults, notifyResultPublished };
