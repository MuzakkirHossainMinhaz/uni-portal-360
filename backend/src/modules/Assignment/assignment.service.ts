import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
import { Faculty } from '../Faculty/faculty.model';
import { OfferedCourse } from '../OfferedCourse/OfferedCourse.model';
import { TAssignment } from './assignment.interface';
import { AssignmentRepository } from './assignment.repository';
import { NotificationServices } from '../Notification/notification.service';
import EnrolledCourse from '../EnrolledCourse/enrolledCourse.model';

const assignmentRepository = new AssignmentRepository();

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

  const result = await assignmentRepository.create({
    ...payload,
    faculty: faculty._id,
  });

  // Notify enrolled students
  // Assuming we have a way to find enrolled students
  const enrolledStudents = await EnrolledCourse.find({
    offeredCourse: payload.offeredCourse,
    isEnrolled: true
  }).populate({
    path: 'student',
    populate: { path: 'user' }
  });

  for (const enrollment of enrolledStudents) {
      const student = enrollment.student as any;
      if (student && student.user) {
        await NotificationServices.createNotification({
            userId: student.user._id,
            title: 'New Assignment Created',
            message: `A new assignment "${payload.title}" has been posted for your course.`,
            type: 'ASSIGNMENT_DUE',
            priority: 'MEDIUM',
            read: false,
            isDeleted: false,
            actionUrl: '/student/assignments'
        });
      }
  }

  return result;
};

const getAllAssignments = async (query: Record<string, unknown>) => {
  const result = await assignmentRepository.findAll(query, ['title', 'description']);
  return result;
};

const getAssignmentById = async (id: string) => {
  const result = await assignmentRepository.findById(id);
  return result;
};

const updateAssignment = async (id: string, payload: Partial<TAssignment>) => {
  const result = await assignmentRepository.updateById(id, payload);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Assignment not found');
  }
  return result;
};

const deleteAssignment = async (id: string) => {
  const result = await assignmentRepository.updateById(id, { isDeleted: true });
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
