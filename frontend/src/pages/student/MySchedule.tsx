import { useGetAllEnrolledCoursesQuery } from '../../redux/features/student/studentCourseManagement.api';
import { TStudentEnrolledCourseSchedule } from '../../types/studentCourse.type';

const MySchedule = () => {
  const { data } = useGetAllEnrolledCoursesQuery(undefined);

  return (
    <div>
      {data?.data?.map((item: TStudentEnrolledCourseSchedule) => (
        <div key={item._id}>
          <div>{item.course.title}</div>
          <div>{item.offeredCourse.section}</div>
          <div>
            {item.offeredCourse.days.map((day) => (
              <span key={day}> {day}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MySchedule;
