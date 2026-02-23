import MySchedule from '../pages/student/MySchedule';
import OfferedCourse from '../pages/student/OfferedCourse';
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentAssignments from '../pages/student/assignment/StudentAssignments';
import StudentAttendance from '../pages/student/attendance/StudentAttendance';
import StudentFees from '../pages/student/fee/StudentFees';
import StudentResults from '../pages/student/results/StudentResults';

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
  {
    name: 'Fees',
    path: 'fees',
    element: <StudentFees />,
  },
];
