import { Button, Card, Col, DatePicker, Form, Row, Select, Table, message } from 'antd';
import moment from 'moment';
import { useState } from 'react';
import { useGetAllOfferedCoursesQuery } from '../../../redux/features/admin/courseManagement';
import { useCreateAttendanceMutation } from '../../../redux/features/attendance/attendance.api';
import { useGetFacultyCoursesQuery } from '../../../redux/features/faculty/facultyCourses.api';

const FacultyAttendance = () => {
  const [form] = Form.useForm();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  
  // Assuming we have an API to get students enrolled in a specific offered course
  // For now, mocking student data structure or using a hypothetical hook
  // const { data: students, isLoading: isStudentsLoading } = useGetEnrolledStudentsQuery(selectedCourse, { skip: !selectedCourse });
  
  const { data: facultyCourses, isLoading: isCoursesLoading } = useGetFacultyCoursesQuery(undefined);
  const [createAttendance, { isLoading: isSubmitting }] = useCreateAttendanceMutation();

  const courseOptions = facultyCourses?.data?.map((item) => ({
    value: item._id,
    label: `${item.course.title} (${item.section}) - ${item.days.join(', ')}`,
  }));

  const handleFinish = async (values) => {
      // Logic to submit attendance
      // Construct payload
      // createAttendance(payload)
      message.success('Attendance submitted (Mock)');
  };

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Mark Attendance</h1>
      <Card>
        <Row gutter={16}>
          <Col span={12}>
            <Select
              style={{ width: '100%' }}
              placeholder="Select Course"
              options={courseOptions}
              onChange={(value) => setSelectedCourse(value)}
              loading={isCoursesLoading}
            />
          </Col>
          <Col span={12}>
            <DatePicker 
                style={{ width: '100%' }} 
                defaultValue={moment()}
                onChange={(date, dateString) => setSelectedDate(dateString)}
            />
          </Col>
        </Row>
      </Card>
      
      {selectedCourse && (
          <div style={{ marginTop: '20px' }}>
              <p>Student list for course {selectedCourse} on {selectedDate} will appear here.</p>
              {/* Table with students and radio buttons for Present/Absent/Late */}
              <Button type="primary" loading={isSubmitting} onClick={() => form.submit()}>
                  Submit Attendance
              </Button>
          </div>
      )}
    </div>
  );
};

export default FacultyAttendance;
