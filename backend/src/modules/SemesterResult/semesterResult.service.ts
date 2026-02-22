import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
import { AcademicSemester } from '../AcademicSemester/academicSemester.model';
import EnrolledCourse from '../EnrolledCourse/enrolledCourse.model';
import { Student } from '../Student/student.model';
import { SemesterResult } from './semesterResult.model';

import { NotificationServices } from '../Notification/notification.service';

const calculateSemesterGPA = async (studentId: string, academicSemesterId: string) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // 1. Get all enrolled courses for the student in this semester
    const enrolledCourses = await EnrolledCourse.find({
      student: studentId,
      academicSemester: academicSemesterId,
      isCompleted: true, // Only include completed courses
    }).populate('course');

    if (!enrolledCourses.length) {
      throw new AppError(httpStatus.NOT_FOUND, 'No completed courses found for this semester');
    }

    let totalCredits = 0;
    let totalGradePoints = 0;

    const completedCourseIds = [];

    // 2. Calculate GPA
    for (const course of enrolledCourses) {
      const credit = (course.course as any).credits;
      const gradePoints = course.gradePoints;

      // Only count credits if gradePoints > 0 (passed)
      // Or should we count F (0.0) in GPA? Usually yes.
      // Assuming F is 0.0 and counted in GPA calculation.
      
      if (credit) {
        totalCredits += credit;
        totalGradePoints += credit * gradePoints;
        completedCourseIds.push(course._id);
      }
    }
    
    // Calculate GPA
    const gpa = totalCredits > 0 ? Number((totalGradePoints / totalCredits).toFixed(2)) : 0;

    // 3. Update or Create Semester Result
    const semesterResult = await SemesterResult.findOneAndUpdate(
      {
        student: studentId,
        academicSemester: academicSemesterId,
      },
      {
        student: studentId,
        academicSemester: academicSemesterId,
        totalCredits,
        totalGradePoints,
        gpa,
        completedCourses: completedCourseIds,
      },
      {
        upsert: true,
        new: true,
        session,
      },
    );

    // 4. Update CGPA
    // Fetch all semester results for the student (including the one just updated/created)
    // We need to re-fetch or use the updated one.
    // Since we are in a transaction, we can just find all.
    
    const allSemesterResults = await SemesterResult.find({ student: studentId }).session(session);

    let totalCumulativeCredits = 0;
    let totalCumulativeGradePoints = 0;

    for (const result of allSemesterResults) {
      totalCumulativeCredits += result.totalCredits;
      totalCumulativeGradePoints += result.totalGradePoints;
    }

    const cgpa =
      totalCumulativeCredits > 0
        ? Number((totalCumulativeGradePoints / totalCumulativeCredits).toFixed(2))
        : 0;

    await Student.findByIdAndUpdate(
      studentId,
      { cgpa },
      { session },
    );

    await session.commitTransaction();
    await session.endSession();

    // Trigger Notification
    // We need the user ID associated with the student
    const student = await Student.findById(studentId).populate('user');
    if (student && student.user) {
        await NotificationServices.createNotification({
            userId: (student.user as any)._id,
            title: 'Results Published',
            message: `Your results for the semester have been updated. Your new GPA is ${gpa}.`,
            type: 'RESULT_PUBLISHED',
            priority: 'HIGH',
            read: false,
            isDeleted: false,
            actionUrl: '/student/results'
        });
    }

    return semesterResult;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.BAD_REQUEST, err.message);
  }
};

const getMySemesterResults = async (studentId: string, query: Record<string, unknown>) => {
    const result = await SemesterResult.find({ student: studentId })
        .populate('academicSemester')
        .sort({ createdAt: -1 }); // Most recent first
    return result;
}

export const SemesterResultServices = {
  calculateSemesterGPA,
  getMySemesterResults,
};
