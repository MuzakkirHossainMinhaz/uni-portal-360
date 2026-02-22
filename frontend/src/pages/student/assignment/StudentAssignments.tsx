import { Button, Card, Col, List, message, Modal, Row, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useGetAllAssignmentsQuery } from '../../../redux/features/assignment/assignment.api';
import { useCreateSubmissionMutation } from '../../../redux/features/submission/submission.api';

const StudentAssignments = () => {
  const { data: assignments, isLoading } = useGetAllAssignmentsQuery(undefined);
  const [createSubmission, { isLoading: isSubmitting }] = useCreateSubmissionMutation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [fileList, setFileList] = useState<any[]>([]);

  const showSubmitModal = (assignment: any) => {
    setSelectedAssignment(assignment);
    setIsModalVisible(true);
    setFileList([]);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedAssignment(null);
    setFileList([]);
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.error('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileList[0]);
    formData.append('data', JSON.stringify({ assignment: selectedAssignment._id }));

    try {
      await createSubmission(formData).unwrap();
      message.success('Assignment submitted successfully');
      setIsModalVisible(false);
      setFileList([]); // Clear file list after success
    } catch (err: any) {
      message.error(err.data?.message || 'Submission failed');
    }
  };

  const props = {
    onRemove: (file: any) => {
      setFileList([]);
    },
    beforeUpload: (file: any) => {
      setFileList([file]);
      return false;
    },
    fileList,
  };

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>My Assignments</h1>
      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={assignments?.data}
        loading={isLoading}
        renderItem={(item: any) => (
          <List.Item>
            <Card title={item.title}>
              <p><strong>Description:</strong> {item.description}</p>
              <p><strong>Deadline:</strong> {new Date(item.deadline).toLocaleString()}</p>
              <Button 
                type="primary" 
                onClick={() => showSubmitModal(item)}
                disabled={new Date() > new Date(item.deadline)}
              >
                {new Date() > new Date(item.deadline) ? 'Deadline Passed' : 'Submit Assignment'}
              </Button>
            </Card>
          </List.Item>
        )}
      />

      <Modal
        title={`Submit: ${selectedAssignment?.title}`}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" loading={isSubmitting} onClick={handleUpload}>
            Submit
          </Button>,
        ]}
      >
        <Upload {...props}>
          <Button icon={<UploadOutlined />}>Select File</Button>
        </Upload>
      </Modal>
    </div>
  );
};

export default StudentAssignments;
