import MySchedule from '../pages/student/MySchedule';
import OfferedCourse from '../pages/student/OfferedCourse';
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentAssignments from '../pages/student/assignment/StudentAssignments';
import StudentResults from '../pages/student/results/StudentResults';
import StudentAttendance from '../pages/student/attendance/StudentAttendance';

export const studentPaths = [
  {
    name: 'Dashboard',
    path: 'dashboard',
    element: <StudentDashboard />,
  },
  {
    name: 'Offered Course',
    path: 'offered-course',
    element: <OfferedCourse />,
  },
  {
    name: 'My Schedule',
    path: 'schedule',
    element: <MySchedule />,
  },
  {
    name: 'Assignments',
    path: 'assignments',
    element: <StudentAssignments />,
  },
  {
    name: 'Results',
    path: 'results',
    element: <StudentResults />,
  },
  {
    name: 'Attendance',
    path: 'attendance',
    element: <StudentAttendance />,
  },
];
