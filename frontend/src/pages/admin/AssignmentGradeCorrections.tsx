import { Alert, App, Button, Card, Form, Input, InputNumber, Modal, Table, Tag } from 'antd';
import { useState } from 'react';
import { useGetAllSubmissionsQuery, useGradeSubmissionMutation } from '../../redux/features/submission/submission.api';
import type { TSubmission } from '../../types/submission.type';

const AssignmentGradeCorrections = () => {
  const { message } = App.useApp();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<TSubmission | null>(null);
  const [form] = Form.useForm<{ grade: number; feedback?: string; correctionReason: string }>();
  const { data, isFetching, isError, refetch } = useGetAllSubmissionsQuery({
    isGraded: 'true',
    page: String(page),
    limit: '10',
  });
  const [correct, { isLoading }] = useGradeSubmissionMutation();

  return (
    <Card title="Published assignment grade corrections">
      {isError && (
        <Alert
          type="error"
          showIcon
          message="Could not load grades"
          action={<Button onClick={refetch}>Retry</Button>}
        />
      )}
      <Table<TSubmission>
        rowKey="_id"
        loading={isFetching}
        dataSource={data?.data ?? []}
        pagination={{ current: page, pageSize: 10, total: data?.meta?.total ?? 0, onChange: setPage }}
        columns={[
          { title: 'Student', render: (_, row) => row.student?.id ?? 'Archived student' },
          {
            title: 'Assignment',
            render: (_, row) => (typeof row.assignment === 'string' ? row.assignment : row.assignment?.title),
          },
          { title: 'Grade', render: (_, row) => `${row.grade ?? 0}/100` },
          { title: 'Corrections', render: (_, row) => row.gradeCorrections?.length ?? 0 },
          {
            title: 'Action',
            render: (_, row) => (
              <Button
                onClick={() => {
                  setSelected(row);
                  form.setFieldsValue({ grade: row.grade, feedback: row.feedback, correctionReason: '' });
                }}
              >
                Review correction
              </Button>
            ),
          },
        ]}
      />
      <Modal
        title="Approve assignment grade correction"
        open={Boolean(selected)}
        onCancel={() => setSelected(null)}
        footer={null}
      >
        {selected && (
          <>
            <Tag>Current grade: {selected.grade}/100</Tag>
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
                  await correct({ id: selected._id, data: values }).unwrap();
                  message.success('Assignment grade correction recorded');
                  setSelected(null);
                } catch {
                  message.error('Correction failed');
                }
              }}
            >
              <Form.Item name="grade" label="Corrected grade" rules={[{ required: true }]}>
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="feedback" label="Feedback">
                <Input.TextArea rows={3} />
              </Form.Item>
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

export default AssignmentGradeCorrections;
