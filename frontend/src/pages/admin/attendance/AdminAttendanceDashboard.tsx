import { Alert, Card, Col, Row, Statistic, Table } from 'antd';
import PageHeader from '../../../components/layout/PageHeader';
import {
  useGetAttendanceAnalyticsQuery,
  useGetLowAttendanceStudentsQuery,
} from '../../../redux/features/attendance/attendance.api';
const AdminAttendanceDashboard = () => {
  const analytics = useGetAttendanceAnalyticsQuery();
  const lowAttendance = useGetLowAttendanceStudentsQuery({ threshold: '75' });
  return (
    <>
      <PageHeader
        title="Attendance Analytics"
        subTitle="Attendance records and students below 75% participation. Late attendance counts as participation."
      />
      {(analytics.isError || lowAttendance.isError) && (
        <Alert type="error" showIcon message="Could not load attendance analytics" />
      )}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={analytics.isLoading}>
            <Statistic title="Attendance records" value={analytics.data?.data?.totalAttendance ?? '—'} />
          </Card>
        </Col>
        {['Present', 'Absent', 'Late'].map((status) => (
          <Col key={status} xs={24} sm={12} lg={6}>
            <Card loading={analytics.isLoading}>
              <Statistic
                title={status}
                value={analytics.data?.data?.statusBreakdown.find((item) => item._id === status)?.count ?? 0}
              />
            </Card>
          </Col>
        ))}
      </Row>
      <Card title="Students below 75% attendance">
        <Table
          rowKey={(row) => `${row.student}-${row.offeredCourse}`}
          loading={lowAttendance.isLoading}
          dataSource={lowAttendance.data?.data ?? []}
          scroll={{ x: 550 }}
          columns={[
            { title: 'Student ID', dataIndex: ['studentDetails', 'id'] },
            { title: 'Name', dataIndex: ['studentDetails', 'fullName'] },
            { title: 'Course', dataIndex: ['courseDetails', 'course', 'title'] },
            { title: 'Attendance', dataIndex: 'percentage', render: (value: number) => `${value.toFixed(2)}%` },
          ]}
        />
      </Card>
    </>
  );
};
export default AdminAttendanceDashboard;
