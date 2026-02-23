import { Button, Col, Row, DatePicker, message, Form } from 'antd';
import { useGetFacultyCoursesQuery } from '../../../redux/features/faculty/facultyCourses.api';
import { useCreateAssignmentMutation } from '../../../redux/features/assignment/assignment.api';
import UniForm from '../../../components/form/UniForm';
import UniInput from '../../../components/form/UniInput';
import UniSelect from '../../../components/form/UniSelect';
import { Controller, SubmitHandler } from 'react-hook-form';
import type { Dayjs } from 'dayjs';

type FacultyCourseItem = {
  offeredCourse: {
    _id: string;
    section: string;
  };
  course: {
    title: string;
  };
};

type AssignmentFormValues = {
  title: string;
  offeredCourse: string;
  description?: string;
  deadline?: Dayjs;
};

const CreateAssignment = () => {
  const { data: facultyCourses, isLoading: isCoursesLoading } = useGetFacultyCoursesQuery(undefined);
  const [createAssignment, { isLoading: isCreating }] = useCreateAssignmentMutation();

  const uniqueCoursesMap = new Map<string, { value: string; label: string }>();
  if (facultyCourses?.data) {
    facultyCourses.data.forEach((item) => {
      const source = item as unknown as FacultyCourseItem;
      const course = source.course;
      const offeredCourse = source.offeredCourse;
      if (!uniqueCoursesMap.has(offeredCourse._id)) {
        uniqueCoursesMap.set(offeredCourse._id, {
          value: offeredCourse._id,
          label: `${course.title} (${offeredCourse.section})`,
        });
      }
    });
  }
  const courseOptions = Array.from(uniqueCoursesMap.values());

  const onSubmit: SubmitHandler<AssignmentFormValues> = async (data) => {
    const key = 'assignmentCreate';
    message.loading({ content: 'Creating assignment...', key });
    try {
      const assignmentData = {
        title: data.title,
        offeredCourse: data.offeredCourse,
        description: data.description,
        deadline: data.deadline?.toISOString(),
      };

      await createAssignment(assignmentData).unwrap();
      message.success({ content: 'Assignment created successfully', key, duration: 2 });
    } catch {
      message.error({ content: 'Something went wrong', key, duration: 2 });
    }
  };

  return (
    <Row justify="center">
      <Col span={24}>
        <UniForm<AssignmentFormValues> onSubmit={onSubmit}>
          <Row gutter={20}>
            <Col span={24} md={12} lg={8}>
              <UniInput type="text" name="title" label="Assignment Title" />
            </Col>
            <Col span={24} md={12} lg={8}>
              <UniSelect
                options={courseOptions}
                name="offeredCourse"
                label="Course"
                disabled={isCoursesLoading}
              />
            </Col>
            <Col span={24} md={12} lg={8}>
                <Controller
                    name="deadline"
                    render={({ field }) => (
                      <Form.Item label="Deadline">
                        <DatePicker {...field} style={{ width: '100%' }} showTime />
                      </Form.Item>
                    )}
                />
            </Col>
            <Col span={24}>
              <UniInput type="text" name="description" label="Description" />
            </Col>
          </Row>
          <Button htmlType="submit" type="primary" loading={isCreating}>
            Create Assignment
          </Button>
        </UniForm>
      </Col>
    </Row>
  );
};

export default CreateAssignment;
