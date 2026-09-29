import { Alert, App, Button, Card, Form, Input, InputNumber, Modal, Space, Table, Tag } from 'antd';
import { useState } from 'react';
import { baseApi } from '../../redux/api/baseApi';
import type { TResponse } from '../../types';

type Enrollment = {
  _id: string;
  student: { _id: string; id: string; fullName?: string; name?: { firstName: string; lastName: string } };
  semesterRegistration: { _id: string };
  offeredCourse: { _id: string; section: number };
  course: { title: string };
  courseSnapshot?: { title: string };
  courseMarks: { classTest1: number; midTerm: number; classTest2: number; finalTerm: number };
  grade: string;
  gradeCorrections?: {
    reason: string;
    approvedBy: string;
    correctedAt: string;
    previousGrade: string;
    newGrade: string;
  }[];
};

const gradeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    publishedEnrollments: builder.query<
      { data: Enrollment[]; meta?: { total: number } },
      { page: number; studentId: string }
    >({
      query: ({ page, studentId }) => ({ url: '/enrolled-courses/admin', params: { page, limit: 10, studentId } }),
      transformResponse: (response: TResponse<Enrollment[]>) => ({ data: response.data ?? [], meta: response.meta }),
      providesTags: ['EnrolledCourse'],
    }),
    correctGrade: builder.mutation<
      TResponse<Enrollment>,
      {
        semesterRegistration: string;
        offeredCourse: string;
        student: string;
        courseMarks: Enrollment['courseMarks'];
        correctionReason: string;
      }
    >({
      query: (body) => ({ url: '/enrolled-courses/update-enrolled-course-marks', method: 'PATCH', body }),
      invalidatesTags: ['EnrolledCourse', 'SemesterResult'],
    }),
  }),
});

const { usePublishedEnrollmentsQuery, useCorrectGradeMutation } = gradeApi;

const GradeCorrections = () => {
  const { message } = App.useApp();
  const [page, setPage] = useState(1);
  const [studentId, setStudentId] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Enrollment | null>(null);
  const [form] = Form.useForm<Enrollment['courseMarks'] & { correctionReason: string }>();
  const { data, isFetching, isError, refetch } = usePublishedEnrollmentsQuery({ page, studentId: search });
  const [correct, { isLoading }] = useCorrectGradeMutation();

  return (
    <Card title="Published grade corrections">
      <Space style={{ marginBottom: 16 }}>
        <Input
          aria-label="Student ID"
          placeholder="Student ID"
          value={studentId}
          onChange={(event) => setStudentId(event.target.value)}
          onPressEnter={() => {
            setSearch(studentId);
            setPage(1);
          }}
        />
        <Button
          onClick={() => {
            setSearch(studentId);
            setPage(1);
          }}
        >
          Search
        </Button>
      </Space>
      {isError && (
        <Alert
          type="error"
          message="Could not load published grades"
          action={<Button onClick={refetch}>Retry</Button>}
        />
      )}
      <Table<Enrollment>
        rowKey="_id"
        loading={isFetching}
        dataSource={data?.data ?? []}
        pagination={{ current: page, pageSize: 10, total: data?.meta?.total ?? 0, onChange: setPage }}
        columns={[
          { title: 'Student', render: (_, row) => row.student?.id ?? 'Archived student' },
          { title: 'Course', render: (_, row) => row.courseSnapshot?.title ?? row.course?.title ?? 'Archived course' },
          { title: 'Grade', dataIndex: 'grade' },
          { title: 'Corrections', render: (_, row) => row.gradeCorrections?.length ?? 0 },
          {
            title: 'Action',
            render: (_, row) => (
              <Button
                onClick={() => {
                  setSelected(row);
                  form.setFieldsValue({ ...row.courseMarks, correctionReason: '' });
                }}
              >
                Review correction
              </Button>
            ),
          },
        ]}
      />
      <Modal title="Approve grade correction" open={Boolean(selected)} onCancel={() => setSelected(null)} footer={null}>
        {selected && (
          <>
            <Tag>Current grade: {selected.grade}</Tag>
            {selected.gradeCorrections?.map((item, index) => (
              <p key={index}>
                {item.previousGrade} → {item.newGrade}: {item.reason} ({new Date(item.correctedAt).toLocaleString()})
              </p>
            ))}
            <Form
              form={form}
              layout="vertical"
              onFinish={async (values) => {
                try {
                  const { correctionReason, ...courseMarks } = values;
                  await correct({
                    semesterRegistration: selected.semesterRegistration._id,
                    offeredCourse: selected.offeredCourse._id,
                    student: selected.student._id,
                    courseMarks,
                    correctionReason,
                  }).unwrap();
                  message.success('Correction approved and GPA recalculated');
                  setSelected(null);
                } catch {
                  message.error('Correction failed');
                }
              }}
            >
              {(['classTest1', 'midTerm', 'classTest2', 'finalTerm'] as const).map((key) => (
                <Form.Item key={key} name={key} label={key} rules={[{ required: true }]}>
                  <InputNumber
                    min={0}
                    max={key === 'midTerm' ? 30 : key === 'finalTerm' ? 50 : 10}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              ))}
              <Form.Item name="correctionReason" label="Approval reason" rules={[{ required: true }, { min: 10 }]}>
                <Input.TextArea rows={3} />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={isLoading}>
                Approve correction
              </Button>
            </Form>
          </>
        )}
      </Modal>
    </Card>
  );
};

export default GradeCorrections;
