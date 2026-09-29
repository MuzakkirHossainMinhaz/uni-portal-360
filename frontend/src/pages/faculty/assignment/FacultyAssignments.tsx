import { useState } from 'react';
import { Alert, App, Button, Card, Form, Input, Modal, Table, Tag, Typography, Space } from 'antd';
import {
  useGetAllAssignmentsQuery,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
} from '../../../redux/features/assignment/assignment.api';
import type { Assignment } from '../../../redux/features/assignment/assignment.api';
import { Link } from 'react-router-dom';
import PageHeader from '../../../components/layout/PageHeader';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

const FacultyAssignments = () => {
  const [page, setPage] = useState(1);
  const { data: assignments, isLoading, isError } = useGetAllAssignmentsQuery({ page: String(page), limit: '10' });
  const { message, modal } = App.useApp();
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [form] = Form.useForm<{ title: string; description: string; deadline: string }>();
  const [update, { isLoading: updating }] = useUpdateAssignmentMutation();
  const [remove] = useDeleteAssignmentMutation();

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Course Section',
      dataIndex: ['offeredCourse', 'section'],
      key: 'section',
      render: (text?: string | number) => (text ? <Tag color="blue">{text}</Tag> : 'N/A'),
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (date: string) => {
        const isExpired = dayjs().isAfter(dayjs(date));
        return (
          <Space orientation="vertical" size={0}>
            <Text>{dayjs(date).format('MMM D, YYYY h:mm A')}</Text>
            {isExpired ? <Tag color="error">Closed</Tag> : <Tag color="success">Active</Tag>}
          </Space>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: Assignment) => (
        <Space>
          <Link to={`/faculty/submissions/${record._id}`}>
            <Button icon={<EyeOutlined />} size="small">
              Submissions
            </Button>
          </Link>
          <Button
            size="small"
            onClick={() => {
              setEditing(record);
              form.setFieldsValue({
                title: record.title,
                description: record.description,
                deadline: dayjs(record.deadline).format('YYYY-MM-DDTHH:mm'),
              });
            }}
          >
            Edit
          </Button>
          <Button
            size="small"
            danger
            onClick={() =>
              modal.confirm({
                title: `Delete ${record.title}?`,
                onOk: async () => {
                  try {
                    await remove(record._id).unwrap();
                    message.success('Assignment deleted');
                  } catch {
                    message.error('Could not delete assignment');
                  }
                },
              })
            }
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Assignments"
        subTitle="Manage assignments for your courses."
        breadcrumbs={[{ title: 'Dashboard', href: '/faculty/dashboard' }, { title: 'Assignments' }]}
        extra={
          <Link to="/faculty/create-assignment">
            <Button type="primary" icon={<PlusOutlined />}>
              Create Assignment
            </Button>
          </Link>
        }
      />

      {isError && <Alert type="error" showIcon message="Could not load assignments" />}
      <Card bordered={false}>
        <Table
          dataSource={assignments?.data}
          columns={columns}
          loading={isLoading}
          rowKey="_id"
          pagination={{ current: page, pageSize: 10, total: assignments?.meta?.total, onChange: setPage }}
        />
      </Card>
      <Modal title="Edit assignment" open={Boolean(editing)} onCancel={() => setEditing(null)} footer={null}>
        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            if (!editing) return;
            try {
              await update({
                id: editing._id,
                data: { ...values, deadline: new Date(values.deadline).toISOString() },
              }).unwrap();
              message.success('Assignment updated');
              setEditing(null);
            } catch {
              message.error('Could not update assignment');
            }
          }}
        >
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="deadline" label="Deadline" rules={[{ required: true }]}>
            <Input type="datetime-local" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={updating}>
            Save changes
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default FacultyAssignments;
