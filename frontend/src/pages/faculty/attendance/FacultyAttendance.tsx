import { Button, Card, Col, DatePicker, Form, Row, Select, Table, message, Empty, Typography, Space, Badge, Avatar } from 'antd';
import moment from 'moment';
import { useState } from 'react';
import { useGetAllOfferedCoursesQuery } from '../../../redux/features/admin/courseManagement';
import { useCreateAttendanceMutation } from '../../../redux/features/attendance/attendance.api';
import { useGetFacultyCoursesQuery } from '../../../redux/features/faculty/facultyCourses.api';
import PageHeader from '../../../components/layout/PageHeader';
import { CalendarOutlined, BookOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

const FacultyAttendance = () => {
  const [form] = Form.useForm();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  
  const { data: facultyCourses, isLoading: isCoursesLoading } = useGetFacultyCoursesQuery(undefined);
  const [createAttendance, { isLoading: isSubmitting }] = useCreateAttendanceMutation();

  const courseOptions = facultyCourses?.data?.map((item: any) => ({
    value: item._id,
    label: `${item.course.title} (${item.section})`,
    desc: item.days.join(', '),
  }));

  const handleFinish = async (values: any) => {
      message.success('Attendance submitted successfully');
  };

  // Mock columns for the placeholder table
  const columns = [
      {
          title: 'Student Name',
          dataIndex: 'name',
          key: 'name',
          render: (text: string) => (
              <Space>
                  <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#0f6ad8' }} />
                  <Text strong>{text}</Text>
              </Space>
          )
      },
      {
          title: 'Roll Number',
          dataIndex: 'roll',
          key: 'roll',
      },
      {
          title: 'Status',
          key: 'status',
          render: () => (
              <Space>
                  <Button type="primary" size="small" style={{ backgroundColor: '#52c41a' }}>Present</Button>
                  <Button size="small" danger>Absent</Button>
                  <Button size="small" style={{ borderColor: '#fa8c16', color: '#fa8c16' }}>Late</Button>
              </Space>
          )
      }
  ];

  const mockData = [
      { key: '1', name: 'John Doe', roll: '2023001' },
      { key: '2', name: 'Jane Smith', roll: '2023002' },
      { key: '3', name: 'Alice Johnson', roll: '2023003' },
  ];

  return (
    <div>
      <PageHeader
        title="Mark Attendance"
        subTitle="Record daily attendance for your courses."
        breadcrumbs={[
            { title: 'Dashboard', href: '/faculty/dashboard' },
            { title: 'Attendance' },
        ]}
      />

      <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <Card title="Session Details" bordered={false} style={{ height: '100%' }}>
                <Form layout="vertical">
                    <Form.Item label="Select Course">
                         <Select
                            placeholder="Choose a course"
                            options={courseOptions}
                            onChange={(value) => setSelectedCourse(value)}
                            loading={isCoursesLoading}
                            size="large"
                            suffixIcon={<BookOutlined />}
                        />
                    </Form.Item>
                    <Form.Item label="Date">
                        <DatePicker 
                            style={{ width: '100%' }} 
                            defaultValue={dayjs()}
                            onChange={(date, dateString) => setSelectedDate(dateString as string)}
                            size="large"
                        />
                    </Form.Item>
                    
                    {selectedCourse && (
                         <div style={{ marginTop: 24, padding: 16, background: '#f8fafc', borderRadius: 8 }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>Selected Course Info</Text>
                            <div style={{ marginTop: 8 }}>
                                <Badge status="processing" text={<Text strong>Active Session</Text>} />
                            </div>
                         </div>
                    )}
                </Form>
            </Card>
          </Col>
          
          <Col xs={24} lg={16}>
              <Card 
                title={selectedCourse ? "Student List" : "Attendance Sheet"} 
                bordered={false}
                extra={selectedCourse && <Button type="primary" onClick={() => message.success('Saved')}>Save Attendance</Button>}
                style={{ minHeight: 400 }}
              >
                {selectedCourse ? (
                     <Table 
                        dataSource={mockData} 
                        columns={columns} 
                        pagination={false}
                        rowClassName="editable-row"
                     />
                ) : (
                    <Empty 
                        image={Empty.PRESENTED_IMAGE_SIMPLE} 
                        description="Please select a course to view student list"
                        style={{ margin: '60px 0' }}
                    />
                )}
              </Card>
          </Col>
      </Row>
    </div>
  );
};

export default FacultyAttendance;
