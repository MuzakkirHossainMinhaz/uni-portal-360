import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Faculty } from '../Faculty/faculty.model';
import { OfferedCourse } from '../OfferedCourse/OfferedCourse.model';
import { TAssignment } from './assignment.interface';
import { Assignment } from './assignment.model';

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

  const result = await Assignment.create({
    ...payload,
    faculty: faculty._id,
  });

  return result;
};

const getAllAssignments = async (query: Record<string, unknown>) => {
  // Allow filtering by offeredCourse
  const filter: Record<string, unknown> = {};
  if (query.offeredCourse) {
    filter.offeredCourse = query.offeredCourse;
  }
  
  const result = await Assignment.find(filter).populate('offeredCourse faculty');
  return result;
};

const getAssignmentById = async (id: string) => {
  const result = await Assignment.findById(id).populate('offeredCourse faculty');
  return result;
};

export const AssignmentServices = {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
};
