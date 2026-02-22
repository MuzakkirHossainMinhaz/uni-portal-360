import { Button, Form, InputNumber, Modal, Select, Table, message } from 'antd';
import { useState } from 'react';
import { useGetFacultyCoursesQuery, useUpdateEnrolledCourseMarksMutation } from '../../../redux/features/faculty/facultyCourses.api';

const FacultyGradebook = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form] = Form.useForm();

  const { data: facultyCourses, isLoading } = useGetFacultyCoursesQuery(undefined);
  const [updateMarks, { isLoading: isUpdating }] = useUpdateEnrolledCourseMarksMutation();

  // Filter courses to get unique offered courses (simplified for demo)
  // Ideally, we might want a separate API to just list "My Courses" vs "Enrolled Students in Course X"
  // Here we filter the flat list of enrollments by offeredCourse ID to simulate a course selector.
  
  // Grouping by offeredCourse
  const uniqueCourses = facultyCourses?.data?.reduce((acc: any[], curr: any) => {
      if (!acc.find(item => item.offeredCourse._id === curr.offeredCourse._id)) {
          acc.push(curr);
      }
      return acc;
  }, []) || [];

  const courseOptions = uniqueCourses.map((item: any) => ({
    value: item.offeredCourse._id,
    label: `${item.course.title} (${item.offeredCourse.section})`,
  }));

  // Filter students for selected course
  const students = facultyCourses?.data?.filter((item: any) => item.offeredCourse._id === selectedCourse);

  const handleUpdateMarks = async (values: any) => {
    const payload = {
      semesterRegistration: editingStudent.semesterRegistration._id,
      offeredCourse: editingStudent.offeredCourse._id,
      student: editingStudent.student._id,
      courseMarks: {
        classTest1: Number(values.classTest1),
        midTerm: Number(values.midTerm),
        classTest2: Number(values.classTest2),
        finalTerm: Number(values.finalTerm),
      },
    };

    try {
      await updateMarks(payload).unwrap();
      message.success('Marks updated successfully');
      setIsModalVisible(false);
      setEditingStudent(null);
    } catch (err: any) {
      message.error(err.data?.message || 'Failed to update marks');
    }
  };

  const showEditModal = (record: any) => {
    setEditingStudent(record);
    form.setFieldsValue({
      classTest1: record.courseMarks.classTest1,
      midTerm: record.courseMarks.midTerm,
      classTest2: record.courseMarks.classTest2,
      finalTerm: record.courseMarks.finalTerm,
    });
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: 'Student ID',
      dataIndex: ['student', 'id'],
      key: 'studentId',
    },
    {
      title: 'Name',
      dataIndex: ['student', 'fullName'],
      key: 'name',
    },
    {
      title: 'Class Test 1',
      dataIndex: ['courseMarks', 'classTest1'],
      key: 'classTest1',
    },
    {
      title: 'Mid Term',
      dataIndex: ['courseMarks', 'midTerm'],
      key: 'midTerm',
    },
    {
      title: 'Class Test 2',
      dataIndex: ['courseMarks', 'classTest2'],
      key: 'classTest2',
    },
    {
      title: 'Final Term',
      dataIndex: ['courseMarks', 'finalTerm'],
      key: 'finalTerm',
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: any, record: any) => (
        <Button type="primary" onClick={() => showEditModal(record)}>
          Update Marks
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Faculty Gradebook</h1>
      <Select
        style={{ width: 300, marginBottom: 20 }}
        placeholder="Select Course"
        options={courseOptions}
        onChange={(value) => setSelectedCourse(value)}
        loading={isLoading}
      />

      {selectedCourse && (
        <Table
          dataSource={students}
          columns={columns}
          rowKey="_id"
          pagination={false}
        />
      )}

      <Modal
        title="Update Marks"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleUpdateMarks} layout="vertical">
          <Form.Item label="Class Test 1 (Max 10)" name="classTest1">
            <InputNumber min={0} max={10} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Mid Term (Max 30)" name="midTerm">
            <InputNumber min={0} max={30} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Class Test 2 (Max 10)" name="classTest2">
            <InputNumber min={0} max={10} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Final Term (Max 50)" name="finalTerm">
            <InputNumber min={0} max={50} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isUpdating} block>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FacultyGradebook;
