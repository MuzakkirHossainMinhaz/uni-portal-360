import { useState } from 'react';
import { Alert, App, Button, Card, Col, Row, Table, Tag } from 'antd';
import { useGetMySemesterResultsQuery } from '../../../redux/features/student/semesterResult.api';
import { selectCurrentUser, useCurrentToken } from '../../../redux/features/auth/authSlice';
import { useAppSelector } from '../../../redux/hooks';

type SemesterResult = {
  _id: string;
  academicSemester: {
    name: string;
    year: string;
  };
  totalCredits: number;
  gpa: number;
  completedCourses: string[];
};

const StudentResults = () => {
  const { data: semesterResults, isLoading, isError } = useGetMySemesterResultsQuery(undefined);
  const user = useAppSelector(selectCurrentUser);

  const { message } = App.useApp();
  const token = useAppSelector(useCurrentToken);
  const [downloading, setDownloading] = useState(false);
  const handleDownloadTranscript = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/transcript`, {
        headers: { authorization: token ?? '' },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Could not download transcript');
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `Transcript_${user?.userId}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      message.error('Could not download transcript. Check that results have been published.');
    } finally {
      setDownloading(false);
    }
  };
  const columns = [
    {
      title: 'Semester',
      dataIndex: ['academicSemester', 'name'],
      key: 'semester',
      render: (text: string, record: SemesterResult) => `${text} ${record.academicSemester.year}`,
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
      render: (gpa: number) => <Tag color={gpa >= 3.0 ? 'green' : gpa >= 2.0 ? 'orange' : 'red'}>{gpa.toFixed(2)}</Tag>,
    },
    {
      title: 'Completed Courses',
      dataIndex: 'completedCourses',
      key: 'completedCourses',
      render: (courses: string[]) => courses.length,
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Academic Results</h1>

      {isError && <Alert type="error" message="Could not load results" />}
      <Row gutter={16} style={{ marginBottom: '20px' }}>
        <Col span={24}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
            <Button type="primary" onClick={handleDownloadTranscript} loading={downloading}>
              Download Official Transcript
            </Button>
          </div>
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
