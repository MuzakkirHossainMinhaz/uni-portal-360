import { Button, Form, Input, InputNumber, Modal, Table, message, Card, Space, Tag, Typography, Avatar } from 'antd';
import { UserOutlined, DownloadOutlined, StarOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetAllSubmissionsQuery, useGradeSubmissionMutation } from '../../../redux/features/submission/submission.api';
import PageHeader from '../../../components/layout/PageHeader';
import dayjs from 'dayjs';

const { Text } = Typography;

const FacultySubmissions = () => {
  const { assignmentId } = useParams();
  const { data: submissions, isLoading } = useGetAllSubmissionsQuery({ assignment: assignmentId });
  const [gradeSubmission, { isLoading: isGrading }] = useGradeSubmissionMutation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [form] = Form.useForm();

  const showGradeModal = (record: any) => {
    setSelectedSubmission(record);
    form.setFieldsValue({
      grade: record.grade,
      feedback: record.feedback,
    });
    setIsModalVisible(true);
  };

  const handleGrade = async (values: any) => {
    try {
      await gradeSubmission({
        id: selectedSubmission._id,
        data: {
          grade: values.grade,
          feedback: values.feedback,
        },
      }).unwrap();
      message.success('Submission graded successfully');
      setIsModalVisible(false);
    } catch (err: any) {
      message.error(err.data?.message || 'Grading failed');
    }
  };

  const columns = [
    {
      title: 'Student',
      dataIndex: ['student', 'fullName'],
      key: 'studentName',
      render: (text: string, record: any) => (
          <Space>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#0f6ad8' }} />
              <div>
                  <Text strong>{text}</Text>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.student?.id}</div>
              </div>
          </Space>
      )
    },
    {
      title: 'Submitted At',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date: string) => (
          <Text>{dayjs(date).format('MMM D, YYYY h:mm A')}</Text>
      ),
    },
    {
      title: 'File',
      dataIndex: 'fileUrl',
      key: 'fileUrl',
      render: (url: string) => (
        <a href={url} target="_blank" rel="noopener noreferrer">
          <Button icon={<DownloadOutlined />} size="small">View File</Button>
        </a>
      ),
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
      render: (grade: number) => (
          grade !== undefined ? <Tag color="green">{grade}/100</Tag> : <Tag color="warning">Pending</Tag>
      ),
    },
    {
      title: 'Feedback',
      dataIndex: 'feedback',
      key: 'feedback',
      ellipsis: true,
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: any, record: any) => (
        <Button type="primary" size="small" icon={<StarOutlined />} onClick={() => showGradeModal(record)}>
          Grade
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Submissions"
        subTitle="Review and grade student submissions."
        breadcrumbs={[
            { title: 'Dashboard', href: '/faculty/dashboard' },
            { title: 'Assignments', href: '/faculty/assignments' }, // Assuming this route exists
            { title: 'Submissions' },
        ]}
      />

      <Card bordered={false}>
          <Table
            dataSource={submissions?.data}
            columns={columns}
            loading={isLoading}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
          />
      </Card>

      <Modal
        title="Grade Submission"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleGrade} layout="vertical">
          <Form.Item 
            label="Grade" 
            name="grade" 
            rules={[{ required: true, message: 'Please enter grade' }]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} size="large" />
          </Form.Item>
          <Form.Item label="Feedback" name="feedback">
            <Input.TextArea rows={4} placeholder="Enter feedback for the student..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isGrading} block size="large">
              Submit Grade
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FacultySubmissions;
