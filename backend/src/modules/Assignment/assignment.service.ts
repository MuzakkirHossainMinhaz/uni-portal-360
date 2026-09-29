import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
import { Faculty } from '../Faculty/faculty.model';
import { OfferedCourse } from '../OfferedCourse/offeredCourse.model';
import type { TAssignment } from './assignment.interface';
import { NotificationServices } from '../Notification/notification.service';
import EnrolledCourse from '../EnrolledCourse/enrolledCourse.model';
import type { Types } from 'mongoose';
import type { AcademicActor } from '../../utils/academicAccess';
import { requireFaculty, requireStudent } from '../../utils/academicAccess';
import { Assignment } from './assignment.model';
import QueryBuilder from '../../builder/QueryBuilder';

const createAssignment = async (userId: string, payload: TAssignment) => {
  const faculty = await Faculty.findOne({ id: userId });
  if (!faculty) {
    throw new AppError(httpStatus.NOT_FOUND, 'Faculty not found');
  }

  const offeredCourse = await OfferedCourse.findById(payload.offeredCourse);
  if (!offeredCourse) {
    throw new AppError(httpStatus.NOT_FOUND, 'Offered Course not found');
  }

  // Ensure the faculty owns this course
  // Note: faculty._id is ObjectId, offeredCourse.faculty is ObjectId
  if (offeredCourse.faculty.toString() !== faculty._id.toString()) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to create assignments for this course');
  }

  const session = await mongoose.startSession();
  try {
    return await session.withTransaction(async () => {
      const [result] = await Assignment.create([{ ...payload, faculty: faculty._id }], { session });
      const enrollments = await EnrolledCourse.find({ offeredCourse: payload.offeredCourse, isEnrolled: true })
        .populate('student', 'user')
        .session(session);
      const notifications = enrollments.flatMap((enrollment) => {
        const student = enrollment.student as { user?: Types.ObjectId } | null;
        return student?.user
          ? [
              {
                userId: student.user,
                title: 'New Assignment Created',
                message: `A new assignment "${payload.title}" has been posted for your course.`,
                type: 'ASSIGNMENT_DUE' as const,
                priority: 'MEDIUM' as const,
                read: false,
                isDeleted: false,
                actionUrl: '/student/assignments',
              },
            ]
          : [];
      });
      if (notifications.length) await NotificationServices.createNotifications(notifications, session);
      return result;
    });
  } finally {
    await session.endSession();
  }
};

const assignmentScope = async (actor: AcademicActor): Promise<Record<string, unknown>> => {
  if (actor.role === 'faculty') return { faculty: (await requireFaculty(actor.userId))._id };
  if (actor.role === 'student') {
    const student = await requireStudent(actor.userId);
    const courses = await EnrolledCourse.find({ student: student._id, isEnrolled: true }).distinct('offeredCourse');
    return { offeredCourse: { $in: courses } };
  }
  return {};
};

const getAllAssignments = async (query: Record<string, unknown>, actor: AcademicActor) => {
  const qb = new QueryBuilder(
    Assignment.find(await assignmentScope(actor))
      .populate({ path: 'offeredCourse', populate: { path: 'course', select: 'title' } })
      .populate('faculty', 'name id'),
    query,
  )
    .search(['title', 'description'])
    .filter()
    .sort()
    .paginate();
  return { data: await qb.modelQuery, meta: await qb.countTotal() };
};

const getAssignmentById = async (id: string, actor: AcademicActor) => {
  const result = await Assignment.findOne({ _id: id, ...(await assignmentScope(actor)) }).populate({
    path: 'offeredCourse',
    populate: { path: 'course', select: 'title' },
  });
  if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Assignment not found');
  return result;
};

const updateAssignment = async (id: string, payload: Partial<TAssignment>, actor: AcademicActor) => {
  const result = await Assignment.findOneAndUpdate(
    { _id: id, isDeleted: false, ...(await assignmentScope(actor)) },
    payload,
    { returnDocument: 'after', runValidators: true },
  );
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Assignment not found');
  }
  return result;
};

const deleteAssignment = async (id: string, actor: AcademicActor) => {
  const result = await Assignment.findOneAndUpdate(
    { _id: id, isDeleted: false, ...(await assignmentScope(actor)) },
    { isDeleted: true },
    { returnDocument: 'after' },
  );
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Assignment not found');
  }
  return result;
};

export const AssignmentServices = {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
};
