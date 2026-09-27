import { Alert, App, Button, Card, Table } from 'antd';
import { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import {
  useEnrolCourseMutation,
  useGetMyOfferedCoursesQuery,
} from '../../redux/features/student/studentCourseManagement.api';
const OfferedCourse = () => {
  const { message } = App.useApp();
  const [page, setPage] = useState(1);
  const { data, isFetching, isError, refetch } = useGetMyOfferedCoursesQuery([
    { name: 'page', value: page },
    { name: 'limit', value: 10 },
  ]);
  const [enroll, { isLoading: saving }] = useEnrolCourseMutation();
  const handleEnroll = async (id: string) => {
    try {
      await enroll({ offeredCourse: id }).unwrap();
      message.success('Course enrollment completed');
    } catch (error) {
      const failure = error as { data?: { message?: string } };
      message.error(failure.data?.message ?? 'Could not enroll in this course');
    }
  };
  return (
    <>
      <PageHeader title="Offered Courses" subTitle="Choose an eligible section for the current registration period." />
      {isError && (
        <Alert
          type="error"
          message="Could not load offered courses"
          action={<Button onClick={refetch}>Retry</Button>}
        />
      )}
      <Card>
        <Table
          rowKey="_id"
          loading={isFetching}
          dataSource={data?.data ?? []}
          scroll={{ x: 650 }}
          pagination={{
            current: page,
            pageSize: 10,
            total: data?.meta?.total,
            onChange: setPage,
            showSizeChanger: false,
          }}
          columns={[
            { title: 'Course', dataIndex: ['course', 'title'] },
            { title: 'Section', dataIndex: 'section' },
            { title: 'Days', render: (_, row) => row.days.join(', ') },
            { title: 'Time', render: (_, row) => `${row.startTime}–${row.endTime}` },
            {
              title: 'Action',
              render: (_, row) => (
                <Button type="primary" loading={saving} onClick={() => handleEnroll(row._id)}>
                  Enroll
                </Button>
              ),
            },
          ]}
        />
      </Card>
    </>
  );
};
export default OfferedCourse;
