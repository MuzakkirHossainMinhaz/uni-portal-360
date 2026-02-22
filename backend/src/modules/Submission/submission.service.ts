import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary';
import { Assignment } from '../Assignment/assignment.model';
import EnrolledCourse from '../EnrolledCourse/enrolledCourse.model';
import { Student } from '../Student/student.model';
import { TSubmission } from './submission.interface';
import { Submission } from './submission.model';

const createSubmission = async (userId: string, file: any, payload: TSubmission) => {
  const student = await Student.findOne({ id: userId });
  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student not found');
  }

  const assignment = await Assignment.findById(payload.assignment);
  if (!assignment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Assignment not found');
  }

  // Check deadline
  if (new Date() > new Date(assignment.deadline)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Deadline has passed');
  }

  // Check enrollment
  const isEnrolled = await EnrolledCourse.findOne({
    student: student._id,
    offeredCourse: assignment.offeredCourse,
    isEnrolled: true,
  });

  if (!isEnrolled) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not enrolled in this course');
  }

  // Check duplicate submission
  const isSubmitted = await Submission.findOne({
    student: student._id,
    assignment: assignment._id,
  });

  if (isSubmitted) {
    throw new AppError(httpStatus.CONFLICT, 'You have already submitted this assignment');
  }

  let fileUrl = '';
  if (file) {
    const imageName = `${assignment._id}-${student.id}`;
    const path = file.path;
    const { secure_url } = await sendImageToCloudinary(imageName, path);
    fileUrl = secure_url as string;
  } else {
    throw new AppError(httpStatus.BAD_REQUEST, 'File is required');
  }

  const result = await Submission.create({
    ...payload,
    assignment: assignment._id,
    student: student._id,
    fileUrl,
    submittedAt: new Date(),
  });

  return result;
};

const getAllSubmissions = async (query: Record<string, unknown>) => {
    // Basic filtering
    const filter: Record<string, unknown> = {};
    if (query.assignment) {
        filter.assignment = query.assignment;
    }
    const result = await Submission.find(filter)
        .populate('student')
        .populate('assignment');
    return result;
};

const gradeSubmission = async (id: string, payload: { grade: number; feedback?: string }) => {
  const submission = await Submission.findById(id);
  if (!submission) {
    throw new AppError(httpStatus.NOT_FOUND, 'Submission not found');
  }

  submission.grade = payload.grade;
  submission.feedback = payload.feedback;
  submission.isGraded = true;
  await submission.save();

  return submission;
};

export const SubmissionServices = {
  createSubmission,
  getAllSubmissions,
  gradeSubmission,
};
