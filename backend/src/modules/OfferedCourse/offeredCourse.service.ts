import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { AcademicDepartment } from '../AcademicDepartment/academicDepartment.model';
import { AcademicFaculty } from '../AcademicFaculty/academicFaculty.model';
import { Course, CourseFaculty } from '../Course/course.model';
import { Faculty } from '../Faculty/faculty.model';
import { SemesterRegistration } from '../SemesterRegistration/semesterRegistration.model';
import { Student } from '../Student/student.model';
import type { TOfferedCourse } from './offeredCourse.interface';
import { OfferedCourse } from './offeredCourse.model';
import { hasTimeConflict } from './offeredCourse.utils';
import { getPagination } from '../../utils/pagination';

const createOfferedCourse = async (payload: TOfferedCourse) => {
  const {
    semesterRegistration,
    academicFaculty,
    academicDepartment,
    course,
    section,
    faculty,
    days,
    startTime,
    endTime,
  } = payload;
  const isSemesterRegistrationExits = await SemesterRegistration.findById(semesterRegistration);

  if (!isSemesterRegistrationExits) {
    throw new AppError(httpStatus.NOT_FOUND, 'Semester registration not found !');
  }
  if (isSemesterRegistrationExits.status !== 'UPCOMING') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Courses can only be offered for an upcoming semester');
  }

  const academicSemester = isSemesterRegistrationExits.academicSemester;

  const isAcademicFacultyExits = await AcademicFaculty.findById(academicFaculty);

  if (!isAcademicFacultyExits) {
    throw new AppError(httpStatus.NOT_FOUND, 'Academic Faculty not found !');
  }

  const isAcademicDepartmentExits = await AcademicDepartment.findById(academicDepartment);

  if (!isAcademicDepartmentExits) {
    throw new AppError(httpStatus.NOT_FOUND, 'Academic Department not found !');
  }

  const isCourseExits = await Course.findById(course);

  if (!isCourseExits || isCourseExits.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Course not found !');
  }

  const isFacultyExits = await Faculty.findById(faculty);

  if (!isFacultyExits || isFacultyExits.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Faculty not found !');
  }
  const isDepartmentBelongToFaculty = await AcademicDepartment.findOne({
    _id: academicDepartment,
    academicFaculty,
  });

  if (!isDepartmentBelongToFaculty) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `This ${isAcademicDepartmentExits.name} is not  belong to this ${isAcademicFacultyExits.name}`,
    );
  }
  if (String(isFacultyExits.academicDepartment) !== String(academicDepartment)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Faculty member does not belong to the selected department');
  }
  if (!(await CourseFaculty.exists({ course, faculties: faculty }))) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Assign this faculty member to the course first');
  }

  const isSameOfferedCourseExistsWithSameRegisteredSemesterWithSameSection = await OfferedCourse.findOne({
    semesterRegistration,
    course,
    section,
  });

  if (isSameOfferedCourseExistsWithSameRegisteredSemesterWithSameSection) {
    throw new AppError(httpStatus.BAD_REQUEST, `Offered course with same section is already exist!`);
  }
  const assignedSchedules = await OfferedCourse.find({
    semesterRegistration,
    faculty,
    days: { $in: days },
  }).select('days startTime endTime');

  const newSchedule = {
    days,
    startTime,
    endTime,
  };

  if (hasTimeConflict(assignedSchedules, newSchedule)) {
    throw new AppError(httpStatus.CONFLICT, `This faculty is not available at that time ! Choose other time or day`);
  }

  const result = await OfferedCourse.create({
    ...payload,
    academicSemester,
  });
  return result;
};

const getAllOfferedCourses = async (query: Record<string, unknown>, facultyUserId?: string) => {
  const faculty = facultyUserId ? await Faculty.findOne({ id: facultyUserId }).select('_id') : null;
  if (facultyUserId && !faculty) throw new AppError(httpStatus.NOT_FOUND, 'Faculty not found');
  const offeredCourseQuery = new QueryBuilder(
    OfferedCourse.find(faculty ? { faculty: faculty._id } : {})
      .populate('semesterRegistration', 'status academicSemester')
      .populate('academicSemester', 'name year')
      .populate('academicFaculty', 'name')
      .populate('academicDepartment', 'name')
      .populate('course', 'title prefix code credits')
      .populate('faculty', 'name id'),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await offeredCourseQuery.modelQuery;
  const meta = await offeredCourseQuery.countTotal();

  return {
    meta,
    data: result,
  };
};

const getMyOfferedCourses = async (userId: string, query: Record<string, unknown>) => {
  const { page, limit, skip } = getPagination(query);

  const student = await Student.findOne({ id: userId });
  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  const currentOngoingRegistrationSemester = await SemesterRegistration.findOne({
    status: 'ONGOING',
  });

  if (!currentOngoingRegistrationSemester) {
    return { meta: { page, limit, total: 0, totalPages: 1, hasNext: false }, data: [] };
  }

  const aggregationQuery = [
    {
      $match: {
        semesterRegistration: currentOngoingRegistrationSemester?._id,
        academicFaculty: student.academicFaculty,
        academicDepartment: student.academicDepartment,
      },
    },
    {
      $lookup: {
        from: 'courses',
        localField: 'course',
        foreignField: '_id',
        as: 'course',
      },
    },
    {
      $unwind: '$course',
    },
    {
      $lookup: {
        from: 'enrolledcourses',
        let: {
          currentOngoingRegistrationSemester: currentOngoingRegistrationSemester._id,
          currentStudent: student._id,
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ['$semesterRegistration', '$$currentOngoingRegistrationSemester'],
                  },
                  {
                    $eq: ['$student', '$$currentStudent'],
                  },
                  {
                    $eq: ['$isEnrolled', true],
                  },
                ],
              },
            },
          },
        ],
        as: 'enrolledCourses',
      },
    },
    {
      $lookup: {
        from: 'enrolledcourses',
        let: {
          currentStudent: student._id,
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ['$student', '$$currentStudent'],
                  },
                  {
                    $eq: ['$isCompleted', true],
                  },
                  { $gt: ['$gradePoints', 0] },
                ],
              },
            },
          },
        ],
        as: 'completedCourses',
      },
    },
    {
      $addFields: {
        'course.preRequisiteCourses': {
          $filter: {
            input: '$course.preRequisiteCourses',
            as: 'prerequisite',
            cond: { $ne: ['$$prerequisite.isDeleted', true] },
          },
        },
        completedCourseIds: {
          $map: {
            input: '$completedCourses',
            as: 'completed',
            in: '$$completed.course',
          },
        },
      },
    },
    {
      $addFields: {
        isPreRequisitesFulFilled: {
          $or: [
            { $eq: ['$course.preRequisiteCourses', []] },
            {
              $setIsSubset: ['$course.preRequisiteCourses.course', '$completedCourseIds'],
            },
          ],
        },

        isAlreadyEnrolled: {
          $in: [
            '$course._id',
            {
              $map: {
                input: '$enrolledCourses',
                as: 'enroll',
                in: '$$enroll.course',
              },
            },
          ],
        },
      },
    },
    {
      $match: {
        'course.isDeleted': { $ne: true },
        maxCapacity: { $gt: 0 },
        isAlreadyEnrolled: false,
        isPreRequisitesFulFilled: true,
      },
    },
  ];

  const paginationQuery = [
    { $sort: { _id: 1 as const } },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ];

  const result = await OfferedCourse.aggregate([...aggregationQuery, ...paginationQuery]);

  const [count] = await OfferedCourse.aggregate([...aggregationQuery, { $count: 'total' }]);
  const total = count?.total ?? 0;
  const totalPages = Math.ceil(total / limit) || 1;
  const hasNext = page < totalPages;

  return {
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext,
    },
    data: result,
  };
};

const getSingleOfferedCourse = async (id: string) => {
  const offeredCourse = await OfferedCourse.findById(id)
    .populate('semesterRegistration', 'status academicSemester')
    .populate('academicSemester', 'name year')
    .populate('academicFaculty', 'name')
    .populate('academicDepartment', 'name')
    .populate('course', 'title prefix code credits')
    .populate('faculty', 'name id');

  if (!offeredCourse) {
    throw new AppError(404, 'Offered Course not found');
  }

  return offeredCourse;
};

const updateOfferedCourse = async (
  id: string,
  payload: Partial<Pick<TOfferedCourse, 'faculty' | 'maxCapacity' | 'days' | 'startTime' | 'endTime'>>,
) => {
  const isOfferedCourseExists = await OfferedCourse.findById(id);

  if (!isOfferedCourseExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Offered course not found !');
  }

  const faculty = payload.faculty ?? isOfferedCourseExists.faculty;
  const days = payload.days ?? isOfferedCourseExists.days;
  const startTime = payload.startTime ?? isOfferedCourseExists.startTime;
  const endTime = payload.endTime ?? isOfferedCourseExists.endTime;
  if (endTime <= startTime) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Start time must be before end time');
  }
  const isFacultyExists = await Faculty.findById(faculty);

  if (!isFacultyExists || isFacultyExists.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Faculty not found !');
  }

  const semesterRegistration = isOfferedCourseExists.semesterRegistration;
  const semesterRegistrationStatus = await SemesterRegistration.findById(semesterRegistration);

  if (semesterRegistrationStatus?.status !== 'UPCOMING') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `You can not update this offered course as it is ${semesterRegistrationStatus?.status}`,
    );
  }
  if (String(isFacultyExists.academicDepartment) !== String(isOfferedCourseExists.academicDepartment)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Faculty member does not belong to the course department');
  }
  if (!(await CourseFaculty.exists({ course: isOfferedCourseExists.course, faculties: faculty }))) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Assign this faculty member to the course first');
  }
  const assignedSchedules = await OfferedCourse.find({
    semesterRegistration,
    faculty,
    days: { $in: days },
    _id: { $ne: id },
  }).select('days startTime endTime');

  const newSchedule = {
    days,
    startTime,
    endTime,
  };

  if (hasTimeConflict(assignedSchedules, newSchedule)) {
    throw new AppError(httpStatus.CONFLICT, `This faculty is not available at that time ! Choose other time or day`);
  }

  const result = await OfferedCourse.findByIdAndUpdate(id, payload, {
    returnDocument: 'after',
    runValidators: true,
  });
  return result;
};

const deleteOfferedCourse = async (id: string) => {
  const isOfferedCourseExists = await OfferedCourse.findById(id);

  if (!isOfferedCourseExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Offered Course not found');
  }

  const semesterRegistation = isOfferedCourseExists.semesterRegistration;

  const semesterRegistrationStatus = await SemesterRegistration.findById(semesterRegistation).select('status');

  if (semesterRegistrationStatus?.status !== 'UPCOMING') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Offered course cannot be deleted because the semester is ${semesterRegistrationStatus?.status ?? 'missing'}`,
    );
  }

  const result = await OfferedCourse.findByIdAndDelete(id);

  return result;
};

export const OfferedCourseServices = {
  createOfferedCourse,
  getAllOfferedCourses,
  getMyOfferedCourses,
  getSingleOfferedCourse,
  deleteOfferedCourse,
  updateOfferedCourse,
};
