import { Card, Col, Row, Table, Tag } from 'antd';
import { useGetMySemesterResultsQuery } from '../../../redux/features/student/semesterResult.api';

const StudentResults = () => {
  const { data: semesterResults, isLoading } = useGetMySemesterResultsQuery(undefined);

  const columns = [
    {
      title: 'Semester',
      dataIndex: ['academicSemester', 'name'],
      key: 'semester',
      render: (text: string, record: any) => `${text} ${record.academicSemester.year}`,
    },
    {
      title: 'Credits',
      dataIndex: 'totalCredits',
      key: 'totalCredits',
    },
    {
      title: 'GPA',
      dataIndex: 'gpa',
      key: 'gpa',
      render: (gpa: number) => (
        <Tag color={gpa >= 3.0 ? 'green' : gpa >= 2.0 ? 'orange' : 'red'}>
          {gpa.toFixed(2)}
        </Tag>
      ),
    },
    {
      title: 'Completed Courses',
      dataIndex: 'completedCourses',
      key: 'completedCourses',
      render: (courses: any[]) => courses.length,
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Academic Results</h1>
      
      <Row gutter={16} style={{ marginBottom: '20px' }}>
        <Col span={24}>
          <Card title="Result History">
            <Table
              dataSource={semesterResults?.data}
              columns={columns}
              loading={isLoading}
              rowKey="_id"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StudentResults;
