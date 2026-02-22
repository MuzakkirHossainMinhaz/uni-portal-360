import { Button, Card, Col, Row, Table, Tag } from 'antd';
import { useGetMySemesterResultsQuery } from '../../../redux/features/student/semesterResult.api';
import { selectCurrentUser } from '../../../redux/features/auth/authSlice';
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
  const { data: semesterResults, isLoading } = useGetMySemesterResultsQuery(undefined);
  const user = useAppSelector(selectCurrentUser);

  const handleDownloadTranscript = async () => {
      // In a real app, you would use RTK Query mutation or fetch to get the blob
      // and trigger a download.
      // For now, a simple window.open or direct link works if using cookies for auth,
      // but since we likely use Bearer tokens, we need to fetch with headers.
      
      try {
          const token = localStorage.getItem('token'); // Assuming token is stored here or in state
          const response = await fetch('http://localhost:5000/api/v1/transcript', {
              headers: {
                  'Authorization': `${token}` // Adjust based on your auth header format (e.g. `Bearer ${token}`)
              }
          });
          
          if (!response.ok) throw new Error('Download failed');
          
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Transcript_${user?.userId}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
      } catch (error) {
          console.error('Error downloading transcript:', error);
          alert('Failed to download transcript');
      }
  };

  const columns = [
    {
      title: 'Semester',
      dataIndex: ['academicSemester', 'name'],
      key: 'semester',
      render: (text: string, record: SemesterResult) =>
        `${text} ${record.academicSemester.year}`,
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
      render: (courses: string[]) => courses.length,
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Academic Results</h1>
      
      <Row gutter={16} style={{ marginBottom: '20px' }}>
        <Col span={24}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
             <Button type="primary" onClick={handleDownloadTranscript}>Download Official Transcript</Button>
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
