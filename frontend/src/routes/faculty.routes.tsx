import FacultyDashboard from '../pages/faculty/FacultyDashboard';
import MyCourses from '../pages/faculty/MyCourses';
import MyStudents from '../pages/faculty/MyStudents';
import CreateAssignment from '../pages/faculty/assignment/CreateAssignment';
import FacultyAssignments from '../pages/faculty/assignment/FacultyAssignments';
import FacultySubmissions from '../pages/faculty/submission/FacultySubmissions';
import FacultyGradebook from '../pages/faculty/gradebook/FacultyGradebook';
import FacultyAttendance from '../pages/faculty/attendance/FacultyAttendance';

export const facultyPaths = [
  {
    name: 'Dashboard',
    path: 'dashboard',
    element: <FacultyDashboard />,
  },
  {
    name: 'My Courses',
    path: 'courses',
    element: <MyCourses />,
  },
  {
    path: 'courses/:registerSemesterId/:courseId',
    element: <MyStudents />,
  },
  {
    name: 'Assignments',
    path: 'assignments',
    element: <FacultyAssignments />,
  },
  {
    path: 'create-assignment',
    element: <CreateAssignment />,
  },
  {
    path: 'submissions/:assignmentId',
    element: <FacultySubmissions />,
  },
  {
    name: 'Gradebook',
    path: 'gradebook',
    element: <FacultyGradebook />,
  },
  {
    name: 'Attendance',
    path: 'attendance',
    element: <FacultyAttendance />,
  },
];
