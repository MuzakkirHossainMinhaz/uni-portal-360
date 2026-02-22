import { Card, Col, Row, Table, Tag } from 'antd';
import moment from 'moment';
import { useGetMyAttendanceQuery } from '../../../redux/features/attendance/attendance.api';

const StudentAttendance = () => {
  const { data: attendanceData, isLoading } = useGetMyAttendanceQuery(undefined);

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => moment(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Course',
      dataIndex: 'offeredCourse',
      key: 'course',
      render: (item: any) => item?.course?.title || 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'green';
        if (status === 'Absent') color = 'volcano';
        if (status === 'Late') color = 'gold';
        return (
          <Tag color={color} key={status}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Remark',
      dataIndex: 'remark',
      key: 'remark',
    },
  ];

  // Calculate summary stats
  const totalClasses = attendanceData?.data?.length || 0;
  const presentCount = attendanceData?.data?.filter((a: any) => a.status === 'Present').length || 0;
  const absentCount = attendanceData?.data?.filter((a: any) => a.status === 'Absent').length || 0;
  const lateCount = attendanceData?.data?.filter((a: any) => a.status === 'Late').length || 0;
  const attendancePercentage = totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(2) : 0;

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>My Attendance</h1>
      
      <Row gutter={16} style={{ marginBottom: '20px' }}>
        <Col span={6}>
          <Card title="Total Classes" bordered={false}>
            {totalClasses}
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Present %" bordered={false} style={{ color: Number(attendancePercentage) < 75 ? 'red' : 'green' }}>
            {attendancePercentage}%
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Absences" bordered={false}>
            {absentCount}
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Late" bordered={false}>
            {lateCount}
          </Card>
        </Col>
      </Row>

      <Table
        loading={isLoading}
        columns={columns}
        dataSource={attendanceData?.data}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default StudentAttendance;
