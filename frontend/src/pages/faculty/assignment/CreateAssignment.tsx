import { useRef } from 'react';
import { Alert, App, Button, Col, Row, DatePicker, Form } from 'antd';
import { useGetFacultyOfferingsQuery } from '../../../redux/features/faculty/facultyCourses.api';
import { useCreateAssignmentMutation } from '../../../redux/features/assignment/assignment.api';
import type { UniFormHandle } from '../../../components/form/UniForm';
import UniForm from '../../../components/form/UniForm';
import UniInput from '../../../components/form/UniInput';
import UniSelect from '../../../components/form/UniSelect';
import type { SubmitHandler } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import type { Dayjs } from 'dayjs';

type AssignmentFormValues = {
  title: string;
  offeredCourse: string;
  description?: string;
  deadline?: Dayjs;
};

const CreateAssignment = () => {
  const { message } = App.useApp();
  const formRef = useRef<UniFormHandle>(null);
  const {
    data: facultyCourses,
    isLoading: isCoursesLoading,
    isError: coursesError,
  } = useGetFacultyOfferingsQuery(undefined);
  const [createAssignment, { isLoading: isCreating }] = useCreateAssignmentMutation();

  const courseOptions =
    facultyCourses?.data.map((item) => ({
      value: item._id,
      label: item.course.title + ' (Section ' + item.section + ')',
    })) ?? [];

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
      formRef.current?.reset();
      message.success({ content: 'Assignment created successfully', key, duration: 2 });
    } catch {
      message.error({ content: 'Something went wrong', key, duration: 2 });
    }
  };

  return (
    <Row justify="center">
      <Col span={24}>
        {coursesError && <Alert type="error" message="Could not load assigned courses" />}
        <UniForm<AssignmentFormValues> ref={formRef} onSubmit={onSubmit} resetOnSubmit={false}>
          <Row gutter={20}>
            <Col span={24} md={12} lg={8}>
              <UniInput type="text" name="title" label="Assignment Title" required />
            </Col>
            <Col span={24} md={12} lg={8}>
              <UniSelect
                options={courseOptions}
                name="offeredCourse"
                label="Course"
                required
                disabled={isCoursesLoading}
              />
            </Col>
            <Col span={24} md={12} lg={8}>
              <Controller
                name="deadline"
                rules={{ required: 'Deadline is required' }}
                render={({ field, fieldState: { error } }) => (
                  <Form.Item
                    label="Deadline"
                    required
                    validateStatus={error ? 'error' : undefined}
                    help={error?.message}
                  >
                    <DatePicker {...field} style={{ width: '100%' }} showTime />
                  </Form.Item>
                )}
              />
            </Col>
            <Col span={24}>
              <UniInput type="text" name="description" label="Description" required />
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
