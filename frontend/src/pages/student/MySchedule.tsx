import { Alert, Button, Card, Table } from 'antd';
import { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import { useGetAllEnrolledCoursesQuery } from '../../redux/features/student/studentCourseManagement.api';
const MySchedule = () => {
  const [page, setPage] = useState(1);
  const { data, isFetching, isError, refetch } = useGetAllEnrolledCoursesQuery([
    { name: 'page', value: page },
    { name: 'limit', value: 10 },
    { name: 'current', value: 'true' },
  ]);
  return (
    <>
      <PageHeader title="My Schedule" subTitle="Weekly schedules for your current enrolled courses." />
      {isError && (
        <Alert type="error" message="Could not load schedule" action={<Button onClick={refetch}>Retry</Button>} />
      )}
      <Card>
        <Table
          rowKey="_id"
          loading={isFetching}
          dataSource={data?.data ?? []}
          scroll={{ x: 550 }}
          pagination={{
            current: page,
            pageSize: 10,
            total: data?.meta?.total,
            onChange: setPage,
            showSizeChanger: false,
          }}
          columns={[
            { title: 'Course', dataIndex: ['course', 'title'] },
            { title: 'Section', dataIndex: ['offeredCourse', 'section'] },
            { title: 'Days', render: (_, row) => row.offeredCourse?.days.join(', ') ?? 'Unavailable' },
            {
              title: 'Time',
              render: (_, row) =>
                row.offeredCourse ? `${row.offeredCourse.startTime}–${row.offeredCourse.endTime}` : 'Unavailable',
            },
          ]}
        />
      </Card>
    </>
  );
};
export default MySchedule;
