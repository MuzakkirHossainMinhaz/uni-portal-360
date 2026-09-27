import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary';
import { Assignment } from '../Assignment/assignment.model';
import EnrolledCourse from '../EnrolledCourse/enrolledCourse.model';
import { Student } from '../Student/student.model';
import type { TSubmission } from './submission.interface';
import { SubmissionRepository } from './submission.repository';
import { Submission } from './submission.model';
import type { Express } from 'express';
import type { AcademicActor } from '../../utils/academicAccess';
import { requireFaculty, requireStudent } from '../../utils/academicAccess';

const submissionRepository = new SubmissionRepository();

const createSubmission = async (userId: string, file: Express.Multer.File | undefined, payload: TSubmission) => {
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

  if (!file) {
    throw new AppError(httpStatus.BAD_REQUEST, 'File is required');
  }

  const imageName = `${assignment._id}-${student.id}`;
  const path = file.path;
  const { secure_url } = await sendImageToCloudinary(imageName, path);
  const fileUrl = secure_url as string;

  const result = await submissionRepository.create({
    ...payload,
    assignment: assignment._id,
    student: student._id,
    fileUrl,
    submittedAt: new Date(),
  });

  return result;
};

const getAllSubmissions = async (query: Record<string, unknown>, actor: AcademicActor) => {
  // Basic filtering
  const filter: Record<string, unknown> = {};
  if (query.assignment) {
    filter.assignment = query.assignment;
  }
  if (actor.role === 'faculty') {
    const faculty = await requireFaculty(actor.userId);
    const assignments = await Assignment.find({ faculty: faculty._id }).distinct('_id');
    filter.$and = [{ assignment: { $in: assignments } }];
  } else if (actor.role === 'student') {
    filter.student = (await requireStudent(actor.userId))._id;
  }
  const result = await Submission.find(filter).populate('student', 'name id').populate('assignment');
  return result;
};

const gradeSubmission = async (id: string, payload: { grade: number; feedback?: string }, userId: string) => {
  const submission = await Submission.findById(id);
  if (!submission) {
    throw new AppError(httpStatus.NOT_FOUND, 'Submission not found');
  }
  const faculty = await requireFaculty(userId);
  if (!(await Assignment.exists({ _id: submission.assignment, faculty: faculty._id, isDeleted: false }))) {
    throw new AppError(httpStatus.FORBIDDEN, 'This submission does not belong to your courses');
  }

  submission.grade = payload.grade;
  submission.feedback = payload.feedback;
  submission.isGraded = true;
  await submission.save();

  return submission;
};

const updateSubmission = async (id: string, payload: Partial<TSubmission>, userId: string) => {
  const student = await requireStudent(userId);
  const submission = await Submission.findOne({ _id: id, student: student._id });
  if (!submission) throw new AppError(httpStatus.NOT_FOUND, 'Submission not found');
  const assignment = await Assignment.findById(submission.assignment);
  if (!assignment || assignment.deadline < new Date() || submission.isGraded) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This submission can no longer be edited');
  }
  const result = await Submission.findOneAndUpdate(
    { _id: id, student: student._id, isGraded: false },
    { fileUrl: payload.fileUrl, submittedAt: new Date() },
    { returnDocument: 'after', runValidators: true },
  );
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Submission not found');
  }
  return result;
};

export const SubmissionServices = {
  createSubmission,
  getAllSubmissions,
  gradeSubmission,
  updateSubmission,
};
