import { Card, Col, Row, Statistic, Table, Tabs } from 'antd';
import { useGetAttendanceAnalyticsQuery, useGetLowAttendanceStudentsQuery } from '../../../redux/features/attendance/attendance.api';

const AdminAttendanceDashboard = () => {
  const { data: analyticsData, isLoading: isAnalyticsLoading } = useGetAttendanceAnalyticsQuery(undefined);
  const { data: lowAttendanceData, isLoading: isLowAttendanceLoading } = useGetLowAttendanceStudentsQuery({ threshold: '75' });

  const lowAttendanceColumns = [
    {
      title: 'Student ID',
      dataIndex: ['studentDetails', 'id'],
      key: 'studentId',
    },
    {
      title: 'Name',
      dataIndex: ['studentDetails', 'fullName'],
      key: 'name',
    },
    {
      title: 'Course',
      dataIndex: ['courseDetails', 'course', 'title'], // Assuming populated
      key: 'course',
    },
    {
      title: 'Attendance %',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (val: number) => <span style={{ color: 'red' }}>{val.toFixed(2)}%</span>,
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Attendance Analytics</h1>
      
      <Row gutter={16} style={{ marginBottom: '20px' }}>
        <Col span={8}>
          <Card>
            <Statistic title="Total Attendance Records" value={analyticsData?.data?.totalAttendance} loading={isAnalyticsLoading} />
          </Card>
        </Col>
        {/* Add more summary cards here */}
      </Row>

      <Tabs defaultActiveKey="1" items={[
          {
              key: '1',
              label: 'Low Attendance Alert',
              children: (
                  <Table 
                      columns={lowAttendanceColumns} 
                      dataSource={lowAttendanceData?.data} 
                      loading={isLowAttendanceLoading}
                      rowKey={(record) => `${record.student}-${record.offeredCourse}`}
                  />
              )
          },
          {
              key: '2',
              label: 'Overall Trends',
              children: <p>Chart component would go here</p>
          }
      ]} />
    </div>
  );
};

export default AdminAttendanceDashboard;
