import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
import { sendPrivateSubmission, submissionDownloadUrl } from '../../utils/sendImageToCloudinary';
import { Assignment } from '../Assignment/assignment.model';
import EnrolledCourse from '../EnrolledCourse/enrolledCourse.model';
import { Student } from '../Student/student.model';
import type { TSubmission } from './submission.interface';
import { SubmissionRepository } from './submission.repository';
import { Submission } from './submission.model';
import type { Express } from 'express';
import type { AcademicActor } from '../../utils/academicAccess';
import { requireFaculty, requireStudent } from '../../utils/academicAccess';
import { getPagination } from '../../utils/pagination';
import { AuditLog } from '../AuditLog/auditLog.model';
import { User } from '../User/user.model';

const submissionRepository = new SubmissionRepository();

const createSubmission = async (userId: string, file: Express.Multer.File | undefined, payload: TSubmission) => {
  const student = await Student.findOne({ id: userId });
  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student not found');
  }

  const assignment = await Assignment.findById(payload.assignment);
  if (!assignment || assignment.isDeleted) {
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

  const fileUrl = await sendPrivateSubmission(file);

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
  const { page, limit, skip } = getPagination(query);
  const filter: Record<string, unknown> = {};
  if (query.assignmentIds) {
    const ids = String(query.assignmentIds).split(',');
    if (ids.length > 20 || ids.some((id) => !/^[a-f\d]{24}$/i.test(id))) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Provide at most 20 valid assignment IDs');
    }
    filter.assignment = { $in: ids };
  } else if (query.assignment) {
    filter.assignment = String(query.assignment);
  }
  if (query.isGraded === 'true') filter.isGraded = true;
  if (actor.role === 'faculty') {
    const faculty = await requireFaculty(actor.userId);
    const assignments = await Assignment.find({ faculty: faculty._id }).distinct('_id');
    filter.$and = [{ assignment: { $in: assignments } }];
  } else if (actor.role === 'student') {
    filter.student = (await requireStudent(actor.userId))._id;
  }
  const [result, total] = await Promise.all([
    Submission.find(filter)
      .sort({ submittedAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate('student', 'name id')
      .populate('assignment', 'title deadline offeredCourse'),
    Submission.countDocuments(filter),
  ]);
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    data: result.map((item) => ({
      ...item.toObject({ virtuals: true }),
      fileUrl: submissionDownloadUrl(item.fileUrl),
    })),
    meta: { page, limit, total, totalPages, hasNext: page < totalPages },
  };
};

const gradeSubmission = async (
  id: string,
  payload: { grade: number; feedback?: string; correctionReason?: string },
  userId: string,
  role = 'faculty',
) => {
  const session = await mongoose.startSession();
  try {
    return await session.withTransaction(async () => {
      const submission = await Submission.findById(id).session(session);
      if (!submission) throw new AppError(httpStatus.NOT_FOUND, 'Submission not found');
      if (submission.isGraded) {
        if (!['admin', 'superAdmin'].includes(role)) {
          throw new AppError(httpStatus.CONFLICT, 'Published assignment grades require an Admin correction');
        }
        if (!payload.correctionReason || payload.correctionReason.trim().length < 10) {
          throw new AppError(httpStatus.BAD_REQUEST, 'A correction reason is required for published grades');
        }
      } else {
        if (role !== 'faculty')
          throw new AppError(httpStatus.FORBIDDEN, 'Only assigned faculty can grade a submission');
        const faculty = await requireFaculty(userId);
        if (
          !(await Assignment.exists({ _id: submission.assignment, faculty: faculty._id, isDeleted: false }).session(
            session,
          ))
        ) {
          throw new AppError(httpStatus.FORBIDDEN, 'This submission does not belong to your courses');
        }
      }
      const actor = await User.findOne({ id: userId }).select('_id').session(session);
      if (!actor) throw new AppError(httpStatus.UNAUTHORIZED, 'Grading actor no longer exists');
      const correction = submission.isGraded
        ? {
            approvedBy: userId,
            reason: payload.correctionReason!.trim(),
            previousGrade: submission.grade!,
            newGrade: payload.grade,
            previousFeedback: submission.feedback,
            newFeedback: payload.feedback,
            correctedAt: new Date(),
          }
        : null;
      const result = await Submission.findOneAndUpdate(
        { _id: id, isGraded: submission.isGraded },
        {
          $set: { grade: payload.grade, feedback: payload.feedback, isGraded: true },
          ...(correction ? { $push: { gradeCorrections: correction } } : {}),
        },
        { session, returnDocument: 'after', runValidators: true },
      );
      if (!result) throw new AppError(httpStatus.CONFLICT, 'Submission grade changed; retry');
      await AuditLog.create(
        [
          {
            userId: actor._id,
            action: correction ? 'CORRECT_ASSIGNMENT_GRADE' : 'PUBLISH_ASSIGNMENT_GRADE',
            entityType: 'submissions',
            entityId: id,
            oldValues: { grade: submission.grade ?? null, feedback: submission.feedback ?? null },
            newValues: { grade: payload.grade, feedback: payload.feedback ?? null },
            metadata: { reason: correction?.reason ?? null },
            severity: 'HIGH',
            status: 'SUCCESS',
          },
        ],
        { session },
      );
      return result;
    });
  } finally {
    await session.endSession();
  }
};

const updateSubmission = async (id: string, file: Express.Multer.File | undefined, userId: string) => {
  const student = await requireStudent(userId);
  const submission = await Submission.findOne({ _id: id, student: student._id });
  if (!submission) throw new AppError(httpStatus.NOT_FOUND, 'Submission not found');
  const assignment = await Assignment.findById(submission.assignment);
  if (!assignment || assignment.deadline < new Date() || submission.isGraded) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This submission can no longer be edited');
  }
  if (!file) throw new AppError(httpStatus.BAD_REQUEST, 'File is required');
  const fileUrl = await sendPrivateSubmission(file);
  const result = await Submission.findOneAndUpdate(
    { _id: id, student: student._id, isGraded: false },
    { fileUrl, submittedAt: new Date() },
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
