import { Button, Form, Input, InputNumber, Modal, Table, message } from 'antd';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetAllSubmissionsQuery, useGradeSubmissionMutation } from '../../../redux/features/submission/submission.api';

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
      title: 'Student ID',
      dataIndex: ['student', 'id'],
      key: 'studentId',
    },
    {
      title: 'Student Name',
      dataIndex: ['student', 'fullName'],
      key: 'studentName',
    },
    {
      title: 'Submitted At',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'File',
      dataIndex: 'fileUrl',
      key: 'fileUrl',
      render: (url: string) => (
        <a href={url} target="_blank" rel="noopener noreferrer">
          View File
        </a>
      ),
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
      render: (grade: number) => grade !== undefined ? grade : 'N/A',
    },
    {
      title: 'Feedback',
      dataIndex: 'feedback',
      key: 'feedback',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: any, record: any) => (
        <Button type="primary" onClick={() => showGradeModal(record)}>
          Grade
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Submissions</h1>
      <Table
        dataSource={submissions?.data}
        columns={columns}
        loading={isLoading}
        rowKey="_id"
      />

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
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Feedback" name="feedback">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isGrading} block>
              Submit Grade
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FacultySubmissions;
