import { Alert, Card, Col, Row, Statistic } from 'antd';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import {
  useGetFacultyCoursesQuery,
  useGetFacultyOfferingsQuery,
} from '../../redux/features/faculty/facultyCourses.api';
import { useGetAllAssignmentsQuery } from '../../redux/features/assignment/assignment.api';
const FacultyDashboard = () => {
  const courses = useGetFacultyOfferingsQuery();
  const enrollments = useGetFacultyCoursesQuery([{ name: 'limit', value: 1 }]);
  const assignments = useGetAllAssignmentsQuery({ limit: '1' });
  return (
    <>
      <PageHeader title="Faculty Dashboard" subTitle="Manage your assigned courses and student progress." />
      {(courses.isError || enrollments.isError || assignments.isError) && (
        <Alert type="error" showIcon message="Some dashboard information could not be loaded." />
      )}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card loading={courses.isLoading}>
            <Statistic title="Assigned sections" value={courses.data?.data.length ?? '—'} />
            <Link to="/faculty/courses">View courses</Link>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card loading={enrollments.isLoading}>
            <Statistic title="Student enrollments" value={enrollments.data?.meta?.total ?? '—'} />
            <Link to="/faculty/gradebook">Open gradebook</Link>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card loading={assignments.isLoading}>
            <Statistic title="Assignments" value={assignments.data?.meta?.total ?? '—'} />
            <Link to="/faculty/assignments">Manage assignments</Link>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Class attendance">
            <Link to="/faculty/attendance">Record or review attendance</Link>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Course work">
            <Link to="/faculty/create-assignment">Create an assignment</Link>
          </Card>
        </Col>
      </Row>
    </>
  );
};
export default FacultyDashboard;
