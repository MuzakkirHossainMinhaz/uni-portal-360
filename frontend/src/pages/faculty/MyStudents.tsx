import { useParams } from 'react-router-dom';
import {
  useAddMarkMutation,
  useGetAllFacultyCoursesQuery,
} from '../../redux/features/faculty/facultyCourses.api';
import { Button, Modal, Table } from 'antd';
import { useState } from 'react';
import PHForm from '../../components/form/PHForm';
import PHInput from '../../components/form/PHInput';

type FacultyCourseStudent = {
  _id: string;
  student: {
    _id: string;
    id: string;
    fullName: string;
  };
  semesterRegistration: {
    _id: string;
  };
  offeredCourse: {
    _id: string;
  };
};

type StudentTableRow = {
  key: string;
  name: string;
  roll: string;
  semesterRegistration: string;
  student: string;
  offeredCourse: string;
};

type MarksFormValues = {
  classTest1: number | string;
  classTest2: number | string;
  midTerm: number | string;
  finalTerm: number | string;
};

const MyStudents = () => {
  const { registerSemesterId, courseId } = useParams();
  const { data: facultyCoursesData } = useGetAllFacultyCoursesQuery([
    { name: 'semesterRegistration', value: registerSemesterId },
    { name: 'course', value: courseId },
  ]);

  const tableData: StudentTableRow[] | undefined = facultyCoursesData?.data?.map(
    ({ _id, student, semesterRegistration, offeredCourse }: FacultyCourseStudent) => ({
      key: _id,
      name: student.fullName,
      roll: student.id,
      semesterRegistration: semesterRegistration._id,
      student: student._id,
      offeredCourse: offeredCourse._id,
    }),
  );

  const columns = [
    {
      title: 'Name',
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: 'Roll',
      key: 'roll',
      dataIndex: 'roll',
    },
    {
      title: 'Action',
      key: 'x',
      render: (item: StudentTableRow) => (
        <div>
          <AddMarksModal studentInfo={item} />
        </div>
      ),
    },
  ];

  return <Table columns={columns} dataSource={tableData} />;
};

const AddMarksModal = ({ studentInfo }: { studentInfo: StudentTableRow }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addMark] = useAddMarkMutation();

  const handleSubmit = async (data: MarksFormValues) => {
    const studentMark = {
      semesterRegistration: studentInfo.semesterRegistration,
      offeredCourse: studentInfo.offeredCourse,
      student: studentInfo.student,
      courseMarks: {
        classTest1: Number(data.classTest1),
        midTerm: Number(data.midTerm),
        classTest2: Number(data.classTest2),
        finalTerm: Number(data.finalTerm),
      },
    };

    await addMark(studentMark);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button onClick={showModal}>Add Faculty</Button>
      <Modal
        title="Basic Modal"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <PHForm onSubmit={handleSubmit}>
          <PHInput type="text" name="classTest1" label="Class Test 1" />
          <PHInput type="text" name="classTest2" label="Class Test 2" />
          <PHInput type="text" name="midTerm" label="Midterm" />
          <PHInput type="text" name="finalTerm" label="Final" />
          <Button htmlType="submit">Submit</Button>
        </PHForm>
      </Modal>
    </>
  );
};

export default MyStudents;
