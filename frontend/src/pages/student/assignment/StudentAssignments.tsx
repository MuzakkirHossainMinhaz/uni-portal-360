import { Button, Card, List, message, Modal, Upload, Typography, Tag, Space } from 'antd';
import { UploadOutlined, CalendarOutlined, FileTextOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useGetAllAssignmentsQuery } from '../../../redux/features/assignment/assignment.api';
import { useCreateSubmissionMutation } from '../../../redux/features/submission/submission.api';
import PageHeader from '../../../components/layout/PageHeader';
import dayjs from 'dayjs';

const { Text, Paragraph } = Typography;

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
      setFileList([]);
    } catch (err: any) {
      message.error(err.data?.message || 'Submission failed');
    }
  };

  const props = {
    onRemove: () => {
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
      <PageHeader
        title="My Assignments"
        subTitle="View and submit your course assignments."
        breadcrumbs={[
            { title: 'Dashboard', href: '/student/dashboard' },
            { title: 'Assignments' },
        ]}
      />

      <List
        grid={{ gutter: 24, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 4 }}
        dataSource={assignments?.data}
        loading={isLoading}
        renderItem={(item: any) => {
            const deadline = dayjs(item.deadline);
            const isExpired = dayjs().isAfter(deadline);
            const timeLeft = deadline.diff(dayjs(), 'day');
            
            return (
              <List.Item>
                <Card 
                    title={<Text ellipsis tooltip={item.title}>{item.title}</Text>}
                    bordered={false}
                    hoverable
                    actions={[
                        <Button 
                            type="primary" 
                            onClick={() => showSubmitModal(item)}
                            disabled={isExpired}
                            block
                            style={{ margin: '0 16px' }}
                        >
                            {isExpired ? 'Deadline Passed' : 'Submit Assignment'}
                        </Button>
                    ]}
                    extra={
                        isExpired ? 
                        <Tag color="error">Closed</Tag> : 
                        <Tag color="processing">Active</Tag>
                    }
                >
                  <div style={{ minHeight: 120 }}>
                      <Paragraph ellipsis={{ rows: 3 }} type="secondary">
                          {item.description}
                      </Paragraph>
                      
                      <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
                          <Space>
                              <CalendarOutlined style={{ color: '#8c8c8c' }} />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                  Due: {deadline.format('MMM D, YYYY h:mm A')}
                              </Text>
                          </Space>
                          {!isExpired && (
                              <Space>
                                  <ClockCircleOutlined style={{ color: timeLeft < 3 ? '#faad14' : '#52c41a' }} />
                                  <Text type={timeLeft < 3 ? 'warning' : 'success'} style={{ fontSize: 12 }}>
                                      {timeLeft === 0 ? 'Due today' : `${timeLeft} days left`}
                                  </Text>
                              </Space>
                          )}
                      </Space>
                  </div>
                </Card>
              </List.Item>
            );
        }}
      />

      <Modal
        title={
            <Space>
                <FileTextOutlined />
                <span>Submit Assignment</span>
            </Space>
        }
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
        <div style={{ padding: '20px 0' }}>
            <p style={{ marginBottom: 16 }}>
                Uploading submission for <strong>{selectedAssignment?.title}</strong>
            </p>
            <Upload.Dragger {...props} maxCount={1}>
                <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">
                    Support for a single file upload.
                </p>
            </Upload.Dragger>
        </div>
      </Modal>
    </div>
  );
};

export default StudentAssignments;
