import { Alert, App, Button, Form, InputNumber, Modal, Select, Table } from 'antd';
import { useState } from 'react';
import type { FacultyEnrolledCourse } from '../../../redux/features/faculty/facultyCourses.api';
import {
  useGetFacultyOfferingsQuery,
  useGetFacultyCoursesQuery,
  useUpdateEnrolledCourseMarksMutation,
} from '../../../redux/features/faculty/facultyCourses.api';

type CourseMarks = {
  classTest1: number;
  midTerm: number;
  classTest2: number;
  finalTerm: number;
};

type MarksFormValues = CourseMarks;

const FacultyGradebook = ({ semesterRegistration, courseId }: { semesterRegistration?: string; courseId?: string }) => {
  const { message } = App.useApp();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<FacultyEnrolledCourse | null>(null);
  const [form] = Form.useForm<MarksFormValues>();

  const [page, setPage] = useState(1);
  const offerings = useGetFacultyOfferingsQuery();
  const {
    data: facultyCourses,
    isFetching: isLoading,
    isError,
  } = useGetFacultyCoursesQuery(
    [
      ...(selectedCourse ? [{ name: 'offeredCourse', value: selectedCourse }] : []),
      ...(semesterRegistration ? [{ name: 'semesterRegistration', value: semesterRegistration }] : []),
      ...(courseId ? [{ name: 'course', value: courseId }] : []),
      { name: 'page', value: page },
      { name: 'limit', value: 10 },
    ],
    { skip: !selectedCourse && !courseId },
  );
  const [updateMarks, { isLoading: isUpdating }] = useUpdateEnrolledCourseMarksMutation();

  const enrollmentData = facultyCourses?.data || [];

  const courseOptions =
    offerings.data?.data
      .filter(
        (item) => !courseId || (item.course._id === courseId && item.semesterRegistration._id === semesterRegistration),
      )
      .map((item) => ({ value: item._id, label: item.course.title + ' (Section ' + item.section + ')' })) ?? [];
  const students = enrollmentData;

  const handleUpdateMarks = async (values: MarksFormValues) => {
    if (!editingStudent) {
      return;
    }

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

  const showEditModal = (record: FacultyEnrolledCourse) => {
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
      render: (_: unknown, record: FacultyEnrolledCourse) => (
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
        onChange={(value) => {
          setSelectedCourse(value);
          setPage(1);
        }}
        loading={isLoading}
      />

      {(isError || offerings.isError) && <Alert type="error" message="Could not load gradebook data" />}
      {(selectedCourse || courseId) && (
        <Table
          dataSource={students}
          columns={columns}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: 10,
            total: facultyCourses?.meta?.total,
            onChange: setPage,
            showSizeChanger: false,
          }}
        />
      )}

      <Modal title="Update Marks" open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null}>
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
