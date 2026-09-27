import { useState } from 'react';
import { Alert, Card, Col, Row, Table, Tag } from 'antd';
import moment from 'moment';
import { useGetMyAttendanceQuery } from '../../../redux/features/attendance/attendance.api';

type AttendanceRecord = {
  status: string;
  offeredCourse?: {
    course?: {
      title?: string;
    };
  };
};

const StudentAttendance = () => {
  const [page, setPage] = useState(1);
  const {
    data: attendanceData,
    isLoading,
    isError,
  } = useGetMyAttendanceQuery({ page: String(page), limit: '10', sort: '-date' });

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
      render: (item: AttendanceRecord['offeredCourse']) => item?.course?.title || 'N/A',
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

  const attendanceList = attendanceData?.data as AttendanceRecord[] | undefined;

  const totalClasses = attendanceList?.length || 0;
  const presentCount = attendanceList?.filter((a) => a.status === 'Present').length || 0;
  const absentCount = attendanceList?.filter((a) => a.status === 'Absent').length || 0;
  const lateCount = attendanceList?.filter((a) => a.status === 'Late').length || 0;
  const attendancePercentage = totalClasses > 0 ? (((presentCount + lateCount) / totalClasses) * 100).toFixed(2) : 0;

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>My Attendance</h1>

      <Row gutter={16} style={{ marginBottom: '20px' }}>
        <Col xs={12} lg={6}>
          <Card title="Classes on this page" bordered={false}>
            {totalClasses}
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card
            title="Attended on this page"
            bordered={false}
            style={{ color: Number(attendancePercentage) < 75 ? 'red' : 'green' }}
          >
            {attendancePercentage}%
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card title="Absences on this page" bordered={false}>
            {absentCount}
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card title="Late on this page" bordered={false}>
            {lateCount}
          </Card>
        </Col>
      </Row>

      {isError && <Alert type="error" message="Could not load attendance" />}
      <Table
        loading={isLoading}
        columns={columns}
        dataSource={attendanceData?.data}
        rowKey="_id"
        pagination={{
          current: page,
          pageSize: 10,
          total: attendanceData?.meta?.total,
          onChange: setPage,
          showSizeChanger: false,
        }}
      />
    </div>
  );
};

export default StudentAttendance;
