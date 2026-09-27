import { Alert, Button, Card, Table } from 'antd';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { useGetFacultyOfferingsQuery } from '../../redux/features/faculty/facultyCourses.api';
const MyCourses = () => {
  const { data, isLoading, isError, refetch } = useGetFacultyOfferingsQuery();
  return (
    <>
      <PageHeader title="My Courses" subTitle="Your assigned sections, schedules and student rosters." />
      {isError && (
        <Alert type="error" message="Could not load courses" action={<Button onClick={refetch}>Retry</Button>} />
      )}
      <Card>
        <Table
          rowKey="_id"
          loading={isLoading}
          dataSource={data?.data ?? []}
          scroll={{ x: 650 }}
          columns={[
            { title: 'Course', dataIndex: ['course', 'title'] },
            {
              title: 'Semester',
              render: (_, row) => `${row.academicSemester?.name ?? ''} ${row.academicSemester?.year ?? ''}`,
            },
            { title: 'Section', dataIndex: 'section' },
            { title: 'Schedule', render: (_, row) => `${row.days.join(', ')} ${row.startTime}–${row.endTime}` },
            {
              title: 'Students',
              render: (_, row) => (
                <Link to={`/faculty/courses/${row.semesterRegistration._id}/${row.course._id}`}>View roster</Link>
              ),
            },
          ]}
        />
      </Card>
    </>
  );
};
export default MyCourses;
