import { CourseServices } from '../course.service';
import { Course, CourseFaculty } from '../course.model';
import { Faculty } from '../../Faculty/faculty.model';

describe('CourseServices', () => {
  afterEach(() => jest.restoreAllMocks());

  it('uses the course ID when assigning faculty and keeps existing assignments', async () => {
    jest.spyOn(Course, 'findOne').mockReturnValue({ populate: jest.fn().mockResolvedValue({ _id: 'course-id' }) } as never);
    jest.spyOn(Faculty, 'countDocuments').mockResolvedValue(2);
    const update = jest.spyOn(CourseFaculty, 'findOneAndUpdate').mockResolvedValue({} as never);

    await CourseServices.assignFacultiesWithCourseIntoDB('course-id', ['faculty-1', 'faculty-2']);

    expect(update).toHaveBeenCalledWith(
      { course: 'course-id' },
      { $addToSet: { faculties: { $each: ['faculty-1', 'faculty-2'] } } },
      { upsert: true, returnDocument: 'after' },
    );
  });

  it('rejects a course as its own prerequisite before writing', async () => {
    const update = jest.spyOn(Course, 'findOneAndUpdate');
    await expect(CourseServices.updateCourseIntoDB('course-id', {
      preRequisiteCourses: [{ course: 'course-id' as never, isDeleted: false }],
    })).rejects.toMatchObject({ statusCode: 400 });
    expect(update).not.toHaveBeenCalled();
  });
});
