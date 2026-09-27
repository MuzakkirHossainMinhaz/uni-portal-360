import { Alert, Card, Col, Row, Statistic } from 'antd';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { useGetAllEnrolledCoursesQuery } from '../../redux/features/student/studentCourseManagement.api';
import { useGetAllAssignmentsQuery } from '../../redux/features/assignment/assignment.api';
import { useGetMyFeeSummaryQuery } from '../../redux/features/fee/fee.api';
const StudentDashboard = () => {
  const courses = useGetAllEnrolledCoursesQuery([
    { name: 'limit', value: 1 },
    { name: 'isCompleted', value: 'false' },
  ]);
  const assignments = useGetAllAssignmentsQuery({ limit: '1' });
  const fees = useGetMyFeeSummaryQuery();
  return (
    <>
      <PageHeader title="Student Dashboard" subTitle="Your courses, assignments and fee balance at a glance." />
      {(courses.isError || assignments.isError || fees.isError) && (
        <Alert type="error" showIcon message="Some dashboard information could not be loaded." />
      )}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card loading={courses.isLoading}>
            <Statistic title="Current enrollments" value={courses.data?.meta?.total ?? '—'} />
            <Link to="/student/schedule">View schedule</Link>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card loading={assignments.isLoading}>
            <Statistic title="Course assignments" value={assignments.data?.meta?.total ?? '—'} />
            <Link to="/student/assignments">View assignments</Link>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card loading={fees.isLoading}>
            <Statistic title="Unpaid fees" prefix="$" value={fees.data?.unpaidAmount ?? '—'} />
            <Link to="/student/fees">View fees</Link>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Academic progress">
            <Link to="/student/results">Results and transcript</Link>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Class participation">
            <Link to="/student/attendance">View attendance</Link>
          </Card>
        </Col>
      </Row>
    </>
  );
};
export default StudentDashboard;
