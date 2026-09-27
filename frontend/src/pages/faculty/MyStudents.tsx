import { useParams } from 'react-router-dom';
import FacultyGradebook from './gradebook/FacultyGradebook';
const MyStudents = () => {
  const { registerSemesterId, courseId } = useParams();
  return <FacultyGradebook semesterRegistration={registerSemesterId} courseId={courseId} />;
};
export default MyStudents;
