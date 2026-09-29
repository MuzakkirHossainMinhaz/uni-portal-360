import { Alert, App, Button, Form, InputNumber, Modal, Select, Table } from 'antd';
import { useState } from 'react';
import type { FacultyEnrolledCourse } from '../../../redux/features/faculty/facultyCourses.api';
import {
  useGetFacultyOfferingsQuery,
  useGetFacultyCoursesQuery,
  useUpdateEnrolledCourseMarksMutation,
} from '../../../redux/features/faculty/facultyCourses.api';

type CourseMarks = {
  classTest1?: number | null;
  midTerm?: number | null;
  classTest2?: number | null;
  finalTerm?: number | null;
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

  const handleUpdateMarks = async (values: MarksFormValues, publish = false) => {
    if (!editingStudent) {
      return;
    }

    const payload = {
      semesterRegistration: editingStudent.semesterRegistration._id,
      offeredCourse: editingStudent.offeredCourse._id,
      student: editingStudent.student._id,
      courseMarks: Object.fromEntries(
        (['classTest1', 'midTerm', 'classTest2', 'finalTerm'] as const)
          .filter((key) => values[key] !== undefined && values[key] !== null)
          .map((key) => [key, values[key]]),
      ),
      publish,
    };

    try {
      await updateMarks(payload).unwrap();
      message.success(publish ? 'Results published and locked' : 'Draft marks saved');
      setIsModalVisible(false);
      setEditingStudent(null);
    } catch {
      message.error('Could not save marks; check completeness and publication status');
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
        <Button type="primary" disabled={record.isCompleted} onClick={() => showEditModal(record)}>
          {record.isCompleted ? 'Published' : 'Edit Draft'}
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
        <Form form={form} onFinish={(values) => handleUpdateMarks(values)} layout="vertical">
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
            <Button htmlType="submit" loading={isUpdating}>
              Save Draft
            </Button>{' '}
            <Button
              type="primary"
              loading={isUpdating}
              onClick={async () => {
                const values = await form.validateFields();
                if (
                  (['classTest1', 'midTerm', 'classTest2', 'finalTerm'] as const).some(
                    (key) => values[key] === null || values[key] === undefined,
                  )
                ) {
                  message.error('Enter all four marks before publishing');
                  return;
                }
                await handleUpdateMarks(values, true);
              }}
            >
              Publish Results
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FacultyGradebook;
