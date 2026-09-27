import { Alert, App, Button, Card, DatePicker, Empty, Form, Input, Select, Space, Table } from 'antd';
import { useState } from 'react';
import dayjs from 'dayjs';
import { useGetFacultyOfferingsQuery } from '../../../redux/features/faculty/facultyCourses.api';
import type { AttendanceSheetRow, AttendanceStatus } from '../../../redux/features/attendance/attendance.api';
import {
  useCreateAttendanceMutation,
  useGetFacultyAttendanceSheetQuery,
} from '../../../redux/features/attendance/attendance.api';
import PageHeader from '../../../components/layout/PageHeader';

const FacultyAttendance = () => {
  const { message } = App.useApp();
  const [course, setCourse] = useState('');
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [changes, setChanges] = useState<Record<string, Partial<AttendanceSheetRow>>>({});
  const courses = useGetFacultyOfferingsQuery();
  const sheet = useGetFacultyAttendanceSheetQuery({ offeredCourse: course, date }, { skip: !course });
  const [save, { isLoading: saving }] = useCreateAttendanceMutation();
  const rows = (sheet.currentData?.data ?? []).map((row) => ({ ...row, ...changes[row.student] }));
  const change = (student: string, patch: Partial<AttendanceSheetRow>) =>
    setChanges((value) => ({ ...value, [student]: { ...value[student], ...patch } }));
  const submit = async () => {
    if (rows.some((row) => !row.status)) {
      message.error('Choose a status for every student.');
      return;
    }
    try {
      await save({
        offeredCourse: course,
        date,
        attendanceList: rows.map(({ student, status, remark }) => ({ student, status, remark })),
      }).unwrap();
      setChanges({});
      message.success('Attendance saved');
    } catch {
      message.error('Could not save attendance. Please try again.');
    }
  };
  return (
    <div>
      <PageHeader title="Mark Attendance" subTitle="Record and review daily attendance for your courses." />
      <Card>
        {(courses.isError || sheet.isError) && (
          <Alert
            type="error"
            showIcon
            message="Could not load attendance. Please retry."
            action={
              <Button
                onClick={() => {
                  courses.refetch();
                  if (course) sheet.refetch();
                }}
              >
                Retry
              </Button>
            }
          />
        )}
        <Form layout="vertical">
          <Form.Item label="Course">
            <Select
              value={course || undefined}
              placeholder="Choose a course"
              loading={courses.isLoading}
              disabled={saving}
              options={courses.data?.data.map((item) => ({
                value: item._id,
                label: `${item.course?.title ?? 'Course'} — section ${item.section}`,
              }))}
              onChange={(value) => {
                setCourse(value);
                setChanges({});
              }}
            />
          </Form.Item>
          <Form.Item label="Date">
            <DatePicker
              value={dayjs(date)}
              allowClear={false}
              disabled={saving}
              onChange={(value) => {
                if (value) setDate(value.format('YYYY-MM-DD'));
                setChanges({});
              }}
            />
          </Form.Item>
        </Form>
        {course ? (
          <>
            <Space style={{ marginBottom: 16 }} wrap>
              <Button
                disabled={!rows.length || sheet.isFetching || saving}
                onClick={() =>
                  setChanges(
                    Object.fromEntries(rows.map((row) => [row.student, { status: 'Present', remark: row.remark }])),
                  )
                }
              >
                Mark all present
              </Button>
              <Button
                type="primary"
                loading={saving}
                disabled={!rows.length || sheet.isFetching || sheet.isError}
                onClick={submit}
              >
                Save attendance
              </Button>
            </Space>
            <Table
              rowKey="student"
              dataSource={rows}
              loading={sheet.isFetching}
              scroll={{ x: 650 }}
              pagination={{ pageSize: 20 }}
              columns={[
                { title: 'Student ID', dataIndex: 'id' },
                { title: 'Name', dataIndex: 'name' },
                {
                  title: 'Status',
                  render: (_, row) => (
                    <Select
                      style={{ width: 125 }}
                      placeholder="Choose status"
                      value={row.status ?? undefined}
                      disabled={saving}
                      options={['Present', 'Absent', 'Late'].map((value) => ({ value, label: value }))}
                      onChange={(status: AttendanceStatus) => change(row.student, { status })}
                    />
                  ),
                },
                {
                  title: 'Remark',
                  render: (_, row) => (
                    <Input
                      value={row.remark}
                      disabled={saving}
                      onChange={(event) => change(row.student, { remark: event.target.value })}
                    />
                  ),
                },
              ]}
            />
          </>
        ) : (
          <Empty description="Select a course to load its students" />
        )}
      </Card>
    </div>
  );
};
export default FacultyAttendance;
