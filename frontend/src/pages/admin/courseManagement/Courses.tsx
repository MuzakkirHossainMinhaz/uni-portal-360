import { Button, Modal, Table, Card, Row, Col, Input } from 'antd';
import {
  useAddFacultiesMutation,
  useGetAllCoursesQuery,
} from '../../../redux/features/admin/courseManagement';
import { useState } from 'react';
import PHForm from '../../../components/form/PHForm';
import PHSelect from '../../../components/form/PHSelect';
import { useGetAllFacultiesQuery } from '../../../redux/features/admin/userManagement.api';
import PermissionGuard from '../../../components/layout/PermissionGuard';
import PageHeader from '../../../components/layout/PageHeader';
import { SearchOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { FieldValues, SubmitHandler } from 'react-hook-form';

type CourseTableRow = {
  key: string;
  title: string;
  code: string;
};

type FacultyOption = {
  value: string;
  label: string;
};

const Courses = () => {
  const { data: courses, isFetching } = useGetAllCoursesQuery(undefined);

  const tableData: CourseTableRow[] | undefined = courses?.data?.map(
    ({ _id, title, prefix, code }) => ({
      key: _id,
      title,
      code: `${prefix}${code}`,
    }),
  );

  const columns = [
    {
      title: 'Title',
      key: 'title',
      dataIndex: 'title',
    },
    {
      title: 'Code',
      key: 'code',
      dataIndex: 'code',
    },
    {
      title: 'Action',
      key: 'x',
      render: (item: CourseTableRow) => (
        <PermissionGuard permission="assignFaculties">
          <AddFacultyModal facultyInfo={item} />
        </PermissionGuard>
      ),
      width: '1%',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Course Management"
        subTitle="Manage courses and assign faculties."
        breadcrumbs={[
            { title: 'Dashboard', href: '/admin/dashboard' },
            { title: 'Course Management' },
            { title: 'Courses' },
        ]}
      />

      <Card bordered={false}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
            <Col>
                 <Input 
                    placeholder="Search courses..." 
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                    style={{ width: 300 }}
                 />
            </Col>
            <Col>
                 <Link to="/admin/create-course">
                    <Button type="primary">Create Course</Button>
                 </Link>
            </Col>
        </Row>
        <Table
          loading={isFetching}
          columns={columns}
          dataSource={tableData}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

const AddFacultyModal = ({ facultyInfo }: { facultyInfo: CourseTableRow }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: facultiesData } = useGetAllFacultiesQuery(undefined);
  const [addFaculties] = useAddFacultiesMutation();

  const facultiesOption: FacultyOption[] | undefined = facultiesData?.data?.map(
    (item: { _id: string; fullName: string }) => ({
      value: item._id,
      label: item.fullName,
    }),
  );

  const handleSubmit: SubmitHandler<FieldValues> = (data) => {
    const facultyData = {
      courseId: facultyInfo.key,
      data: (data.faculties || []) as string[],
    };

    addFaculties(facultyData);
    setIsModalOpen(false);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button size="small" onClick={showModal}>Add Faculty</Button>
      <Modal
        title={`Assign Faculty to ${facultyInfo.title}`}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <PHForm onSubmit={handleSubmit}>
          <PHSelect
            mode="multiple"
            options={facultiesOption}
            name="faculties"
            label="Select Faculty"
          />
          <Button type="primary" htmlType="submit" style={{ marginTop: 16 }}>Submit</Button>
        </PHForm>
      </Modal>
    </>
  );
};

export default Courses;
