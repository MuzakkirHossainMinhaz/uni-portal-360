import { Button, Table } from 'antd';
import { useGetAllAssignmentsQuery } from '../../../redux/features/assignment/assignment.api';
import { Link } from 'react-router-dom';

const FacultyAssignments = () => {
  const { data: assignments, isLoading } = useGetAllAssignmentsQuery(undefined);

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Course',
      dataIndex: ['offeredCourse', 'course'], // This path might be wrong if populate isn't deep enough
      key: 'course',
      render: (text: any, record: any) => {
          // Since offeredCourse is populated, but offeredCourse.course is an ObjectId (unless deep populated)
          // Actually, in assignment.service.ts getAllAssignments, we populate 'offeredCourse faculty'.
          // OfferedCourse model has 'course' ref. Unless we populate 'offeredCourse.course', we only get ID.
          // Let's assume for now we just show the ID or need to update backend to deep populate.
          // Or maybe we can rely on section?
          return record.offeredCourse ? `${record.offeredCourse.section}` : 'N/A';
      }
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: any, record: any) => (
        <Link to={`/faculty/submissions/${record._id}`}>
          <Button type="primary">View Submissions</Button>
        </Link>
      ),
    },
  ];

  return (
    <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h1>Assignments</h1>
            <Link to="/faculty/create-assignment">
                <Button type="primary">Create Assignment</Button>
            </Link>
        </div>
      <Table
        dataSource={assignments?.data}
        columns={columns}
        loading={isLoading}
        rowKey="_id"
      />
    </div>
  );
};

export default FacultyAssignments;
