import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { CourseSearchableFields } from './course.constant';
import { TCourse } from './course.interface';
import { Types } from 'mongoose';
import { Course, CourseFaculty } from './course.model';
import { Faculty } from '../Faculty/faculty.model';
import { OfferedCourse } from '../OfferedCourse/OfferedCourse.model';
import { SemesterRegistration } from '../SemesterRegistration/semesterRegistration.model';

const assertPrerequisites = async (courseIds: string[], ownId?: string) => {
  if (new Set(courseIds).size !== courseIds.length || courseIds.includes(ownId ?? '')) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Prerequisites must be distinct and cannot include the course itself');
  }
  if (courseIds.length !== await Course.countDocuments({ _id: { $in: courseIds }, isDeleted: { $ne: true } })) {
    throw new AppError(httpStatus.BAD_REQUEST, 'One or more prerequisite courses do not exist');
  }
};

const createCourseIntoDB = async (payload: TCourse) => {
  await assertPrerequisites((payload.preRequisiteCourses ?? []).map((item) => String(item.course)));
  const result = await Course.create(payload);
  return result;
};

const getAllCoursesFromDB = async (query: Record<string, unknown>) => {
  const courseQuery = new QueryBuilder(Course.find({ isDeleted: { $ne: true } }).populate('preRequisiteCourses.course'), query)
    .search(CourseSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await courseQuery.modelQuery;
  const meta = await courseQuery.countTotal();

  return {
    meta,
    result,
  };
};

const getSingleCourseFromDB = async (id: string) => {
  const result = await Course.findOne({ _id: id, isDeleted: { $ne: true } }).populate('preRequisiteCourses.course');
  if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Course not found');
  return result;
};

const updateCourseIntoDB = async (id: string, payload: Partial<TCourse>) => {
  if (payload.preRequisiteCourses) {
    const selected = payload.preRequisiteCourses.filter((item) => !item.isDeleted).map((item) => String(item.course));
    await assertPrerequisites(selected, id);
    payload.preRequisiteCourses = selected.map((course) => ({ course: new Types.ObjectId(course), isDeleted: false }));
  }
  const result = await Course.findOneAndUpdate({ _id: id, isDeleted: { $ne: true } }, payload, {
    returnDocument: 'after', runValidators: true,
  }).populate('preRequisiteCourses.course');
  if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Course not found');
  return result;
};

const deleteCourseFromDB = async (id: string) => {
  const activeRegistrations = await SemesterRegistration.find({ status: { $in: ['UPCOMING', 'ONGOING'] } }).select('_id');
  if (await OfferedCourse.exists({ course: id, semesterRegistration: { $in: activeRegistrations.map((registration) => registration._id) } })) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Remove active course offerings before deleting this course');
  }
  if (await Course.exists({ preRequisiteCourses: { $elemMatch: { course: id, isDeleted: { $ne: true } } }, isDeleted: { $ne: true } })) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Remove this course from other prerequisites before deleting it');
  }
  const result = await Course.findOneAndUpdate(
    { _id: id, isDeleted: { $ne: true } },
    { isDeleted: true },
    {
      returnDocument: 'after',
    },
  );
  if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Course not found');
  return result;
};

const assignFacultiesWithCourseIntoDB = async (id: string, faculties: string[]) => {
  await getSingleCourseFromDB(id);
  if (new Set(faculties).size !== faculties.length) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Faculty members must be distinct');
  }
  if (faculties.length !== await Faculty.countDocuments({ _id: { $in: faculties }, isDeleted: { $ne: true } })) {
    throw new AppError(httpStatus.BAD_REQUEST, 'One or more faculty members do not exist');
  }
  const result = await CourseFaculty.findOneAndUpdate(
    { course: id },
    {
      $addToSet: { faculties: { $each: faculties } },
    },
    {
      upsert: true,
      returnDocument: 'after',
    },
  );
  return result;
};

const getFacultiesWithCourseFromDB = async (courseId: string) => {
  const result = await CourseFaculty.findOne({ course: courseId }).populate('faculties');
  return result;
};

const removeFacultiesFromCourseFromDB = async (id: string, faculties: string[]) => {
  const activeRegistrations = await SemesterRegistration.find({ status: { $in: ['UPCOMING', 'ONGOING'] } }).select('_id');
  if (await OfferedCourse.exists({ course: id, faculty: { $in: faculties }, semesterRegistration: { $in: activeRegistrations.map((registration) => registration._id) } })) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Faculty members assigned to offerings cannot be removed');
  }
  const result = await CourseFaculty.findOneAndUpdate(
    { course: id },
    {
      $pull: { faculties: { $in: faculties } },
    },
    {
      returnDocument: 'after',
    },
  );
  return result;
};

export const CourseServices = {
  createCourseIntoDB,
  getAllCoursesFromDB,
  getSingleCourseFromDB,
  updateCourseIntoDB,
  deleteCourseFromDB,
  assignFacultiesWithCourseIntoDB,
  getFacultiesWithCourseFromDB,
  removeFacultiesFromCourseFromDB,
};
