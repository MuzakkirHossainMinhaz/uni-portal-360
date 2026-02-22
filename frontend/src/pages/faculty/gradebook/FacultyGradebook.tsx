import { Button, Form, InputNumber, Modal, Select, Table, message } from 'antd';
import { useState } from 'react';
import { useGetFacultyCoursesQuery, useUpdateEnrolledCourseMarksMutation } from '../../../redux/features/faculty/facultyCourses.api';

type CourseMarks = {
  classTest1: number;
  midTerm: number;
  classTest2: number;
  finalTerm: number;
};

type FacultyCourseEnrollment = {
  _id: string;
  student: {
    _id: string;
    id: string;
    fullName: string;
  };
  course: {
    title: string;
  };
  offeredCourse: {
    _id: string;
    section: string;
  };
  semesterRegistration: {
    _id: string;
  };
  courseMarks: CourseMarks;
  grade?: string;
};

type MarksFormValues = CourseMarks;

const FacultyGradebook = () => {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<FacultyCourseEnrollment | null>(null);
  const [form] = Form.useForm<MarksFormValues>();

  const { data: facultyCourses, isLoading } = useGetFacultyCoursesQuery(undefined);
  const [updateMarks, { isLoading: isUpdating }] = useUpdateEnrolledCourseMarksMutation();

  const uniqueCourses =
    facultyCourses?.data?.reduce<FacultyCourseEnrollment[]>((acc, curr: FacultyCourseEnrollment) => {
      if (!acc.find((item) => item.offeredCourse._id === curr.offeredCourse._id)) {
        acc.push(curr);
      }
      return acc;
    }, []) || [];

  const courseOptions = uniqueCourses.map((item) => ({
    value: item.offeredCourse._id,
    label: `${item.course.title} (${item.offeredCourse.section})`,
  }));

  const students =
    facultyCourses?.data?.filter(
      (item: FacultyCourseEnrollment) => item.offeredCourse._id === selectedCourse,
    ) || [];

  const handleUpdateMarks = async (values: MarksFormValues) => {
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
    } catch {
      message.error('Failed to update marks');
    }
  };

  const showEditModal = (record: FacultyCourseEnrollment) => {
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
      render: (_: unknown, record: FacultyCourseEnrollment) => (
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
