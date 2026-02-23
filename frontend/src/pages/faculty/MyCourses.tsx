import { Button, Col, Flex } from 'antd';
import UniForm from '../../components/form/UniForm';
import UniSelect from '../../components/form/UniSelect';
import { useGetFacultyCoursesQuery } from '../../redux/features/faculty/facultyCourses.api';
import { useNavigate } from 'react-router-dom';
import { FieldValues, SubmitHandler } from 'react-hook-form';

type FacultyCourse = {
  academicSemester: {
    name: string;
    year: string;
  };
  semesterRegistration: {
    _id: string;
  };
  course: {
    _id: string;
    title: string;
  };
};

const MyCourses = () => {
  const { data: facultyCoursesData } = useGetFacultyCoursesQuery(undefined);
  const navigate = useNavigate();

  const facultyCourses =
    (facultyCoursesData?.data as unknown as FacultyCourse[]) || [];

  const semesterOptions =
    facultyCourses.map((item) => ({
      label: `${item.academicSemester.name} ${item.academicSemester.year}`,
      value: item.semesterRegistration._id,
    })) ?? [];

  const courseOptions =
    facultyCourses.map((item) => ({
      label: item.course.title,
      value: item.course._id,
    })) ?? [];

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    navigate(`/faculty/courses/${data.semesterRegistration}/${data.course}`);
  };

  return (
    <Flex justify="center" align="center">
      <Col span={6}>
        <UniForm onSubmit={onSubmit}>
          <UniSelect
            options={semesterOptions}
            name="semesterRegistration"
            label="Semester"
          />
          <UniSelect options={courseOptions} name="course" label="Course" />
          <Button htmlType="submit">Submit</Button>
        </UniForm>
      </Col>
    </Flex>
  );
};

export default MyCourses;
