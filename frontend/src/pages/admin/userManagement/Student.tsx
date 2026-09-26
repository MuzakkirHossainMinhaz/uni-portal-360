import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, App, Button, Card, Col, Flex, Modal, Popconfirm, Row, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useRef, useState } from 'react';
import UniForm, { UniFormHandle } from '../../../components/form/UniForm';
import UniInput from '../../../components/form/UniInput';
import UniDatePicker from '../../../components/form/UniDatePicker';
import UniSelect from '../../../components/form/UniSelect';
import { bloodGroupOptions, genderOptions } from '../../../constants/global';
import {
  useGetAllAcademicDepartmentsQuery,
  useGetAllAcademicSemestersQuery,
} from '../../../redux/features/admin/academicManagement.api';
import {
  useAddStudentMutation,
  useDeleteStudentMutation,
  useGetAllStudentsQuery,
  useUpdateStudentMutation,
} from '../../../redux/features/admin/userManagement.api';
import { useThemeMode } from '../../../theme/ThemeProvider';
import { TStudent } from '../../../types';
import { logger } from '../../../utils/logger';

const { Title } = Typography;

type StudentFormValues = {
  firstName: string;
  middleName?: string;
  lastName: string;
  password?: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  email: string;
  contactNo: string;
  emergencyContactNo: string;
  bloodGroup: string;
  presentAddress: string;
  permanentAddress: string;
  fatherName: string;
  fatherOccupation: string;
  fatherContactNo: string;
  motherName: string;
  motherOccupation: string;
  motherContactNo: string;
  localGuardianName: string;
  localGuardianOccupation: string;
  localGuardianContactNo: string;
  localGuardianAddress: string;
  admissionSemester: string;
  academicDepartment: string;
};

type AcademicDepartment = { _id: string; name: string };
type AcademicSemester = { _id: string; name: string; year: string | number };

type ApiError = {
  status?: string;
  error?: string;
  data?: { message?: string; error?: Array<{ path?: string; message?: string }> };
  message?: string;
};

const getStudentName = (student: TStudent) => {
  const structuredName = [student.name?.firstName, student.name?.middleName, student.name?.lastName]
    .filter(Boolean)
    .join(' ');

  return structuredName || student.fullName || student.id || 'N/A';
};

const Student = () => {
  const { message } = App.useApp();
  const { mode } = useThemeMode();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<TStudent | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const formRef = useRef<UniFormHandle>(null);

  const queryParams = useMemo(
    () => [
      { name: 'page', value: currentPage },
      { name: 'limit', value: pageSize },
    ],
    [currentPage, pageSize],
  );
  const { data: studentsData, isLoading, isFetching, error, refetch } = useGetAllStudentsQuery(queryParams);
  const [createStudent] = useAddStudentMutation();
  const [updateStudent] = useUpdateStudentMutation();
  const [deleteStudent] = useDeleteStudentMutation();
  const { data: departmentsData } = useGetAllAcademicDepartmentsQuery([{ name: 'limit', value: 100 }]);
  const { data: semestersData } = useGetAllAcademicSemestersQuery([{ name: 'limit', value: 100 }]);

  const students = studentsData?.data ?? [];
  const departments = departmentsData?.data ?? [];
  const semesters = semestersData?.data ?? [];

  const refreshTable = async (resetToFirstPage = false) => {
    if (resetToFirstPage && currentPage !== 1) {
      setCurrentPage(1);
      return;
    }

    await refetch();
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingStudent(null);
    formRef.current?.reset();
  };

  const handleFormSubmit = async (data: StudentFormValues) => {
    setIsSubmitting(true);
    try {
      const student = {
        name: { firstName: data.firstName, middleName: data.middleName || '', lastName: data.lastName },
        gender: data.gender,
        dateOfBirth: data.dateOfBirth || undefined,
        email: data.email,
        contactNo: data.contactNo,
        emergencyContactNo: data.emergencyContactNo,
        bloodGroup: data.bloodGroup,
        presentAddress: data.presentAddress,
        permanentAddress: data.permanentAddress,
        guardian: {
          fatherName: data.fatherName,
          fatherOccupation: data.fatherOccupation,
          fatherContactNo: data.fatherContactNo,
          motherName: data.motherName,
          motherOccupation: data.motherOccupation,
          motherContactNo: data.motherContactNo,
        },
        localGuardian: {
          name: data.localGuardianName,
          occupation: data.localGuardianOccupation,
          contactNo: data.localGuardianContactNo,
          address: data.localGuardianAddress,
        },
        admissionSemester: data.admissionSemester,
        academicDepartment: data.academicDepartment,
      };

      if (editingStudent) {
        await updateStudent({ data: { student }, id: editingStudent._id }).unwrap();
        await refreshTable();
        message.success('Student updated successfully');
      } else {
        const formData = new FormData();
        formData.append('data', JSON.stringify({ password: data.password || undefined, student }));
        await createStudent(formData).unwrap();
        await refreshTable(true);
        message.success('Student created successfully');
      }

      setIsModalVisible(false);
      setEditingStudent(null);
      formRef.current?.reset();
    } catch (error: unknown) {
      const err = error as ApiError;
      const errMsg =
        err.status === 'TIMEOUT_ERROR'
          ? 'Request timed out. Please try again.'
          : err.data?.message || err.message || 'Something went wrong. Please try again.';

      logger.error('Student form submission failed', {
        status: err.status,
        message: errMsg,
        transportError: err.error,
        validationErrors: err.data?.error ?? [],
      });
      message.error(errMsg, 5);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStudent(id).unwrap();
      await refreshTable();
      message.success('Student deleted successfully');
    } catch (error: unknown) {
      const err = error as ApiError;
      message.error(err.data?.message || 'Delete failed. Please try again.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select items to delete');
      return;
    }

    try {
      await Promise.all(selectedRowKeys.map((id) => deleteStudent(id as string).unwrap()));
      const deletedCount = selectedRowKeys.length;
      setSelectedRowKeys([]);
      await refreshTable(true);
      message.success(`${deletedCount} student(s) deleted successfully`);
    } catch (error: unknown) {
      const err = error as ApiError;
      message.error(err.data?.message || 'Bulk delete failed. Please try again.');
    }
  };

  const columns: ColumnsType<TStudent> = [
    {
      title: 'Student ID',
      dataIndex: 'id',
      key: 'id',
      width: 125,
      render: (id: string) => id || 'N/A',
    },
    {
      title: 'Name',
      key: 'name',
      sorter: (a, b) => getStudentName(a).localeCompare(getStudentName(b)),
      render: (_value, student) => getStudentName(student),
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Department',
      dataIndex: ['academicDepartment', 'name'],
      key: 'academicDepartment',
      render: (departmentName: string) => departmentName || 'N/A',
    },
    {
      title: 'Semester',
      dataIndex: ['admissionSemester', 'name'],
      key: 'admissionSemester',
      render: (semesterName: string, student) =>
        semesterName ? `${semesterName} ${student.admissionSemester?.year}` : 'N/A',
    },
    { title: 'Contact', dataIndex: 'contactNo', key: 'contactNo', render: (contact: string) => contact || 'N/A' },
    { title: 'Gender', dataIndex: 'gender', key: 'gender', render: (gender: string) => gender || 'N/A' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_value, student) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingStudent(student);
              setIsModalVisible(true);
            }}
            style={{ color: mode === 'dark' ? '#e5e7eb' : '#111827' }}
          />
          <Popconfirm
            title="Are you sure you want to delete this student?"
            onConfirm={() => handleDelete(student._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Typography.Text>Loading students...</Typography.Text>
      </div>
    );
  }

  if (error) {
    return <Alert description="Error loading students" type="error" showIcon />;
  }

  const defaultValues = editingStudent
    ? {
      firstName: editingStudent.name?.firstName || '',
      middleName: editingStudent.name?.middleName || '',
      lastName: editingStudent.name?.lastName || '',
      gender: editingStudent.gender || '',
      dateOfBirth: editingStudent.dateOfBirth?.slice(0, 10) || '',
      email: editingStudent.email,
      contactNo: editingStudent.contactNo || '',
      emergencyContactNo: editingStudent.emergencyContactNo || '',
      bloodGroup: editingStudent.bloodGroup || '',
      presentAddress: editingStudent.presentAddress || '',
      permanentAddress: editingStudent.permanentAddress || '',
      fatherName: editingStudent.guardian?.fatherName || '',
      fatherOccupation: editingStudent.guardian?.fatherOccupation || '',
      fatherContactNo: editingStudent.guardian?.fatherContactNo || '',
      motherName: editingStudent.guardian?.motherName || '',
      motherOccupation: editingStudent.guardian?.motherOccupation || '',
      motherContactNo: editingStudent.guardian?.motherContactNo || '',
      localGuardianName: editingStudent.localGuardian?.name || '',
      localGuardianOccupation: editingStudent.localGuardian?.occupation || '',
      localGuardianContactNo: editingStudent.localGuardian?.contactNo || '',
      localGuardianAddress: editingStudent.localGuardian?.address || '',
      admissionSemester: editingStudent.admissionSemester?._id || '',
      academicDepartment: editingStudent.academicDepartment?._id || '',
    }
    : {
      firstName: '',
      middleName: '',
      lastName: '',
      password: '',
      gender: '',
      dateOfBirth: '',
      email: '',
      contactNo: '',
      emergencyContactNo: '',
      bloodGroup: '',
      presentAddress: '',
      permanentAddress: '',
      fatherName: '',
      fatherOccupation: '',
      fatherContactNo: '',
      motherName: '',
      motherOccupation: '',
      motherContactNo: '',
      localGuardianName: '',
      localGuardianOccupation: '',
      localGuardianContactNo: '',
      localGuardianAddress: '',
      admissionSemester: '',
      academicDepartment: '',
    };

  return (
    <div>
      <Card
        style={{
          background: mode === 'dark' ? 'rgba(15,23,42,0.96)' : 'rgba(255,255,255,0.98)',
          borderRadius: 16,
          border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(226, 232, 240, 0.8)',
        }}
      >
        <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
          <Space orientation="vertical" size={4}>
            <Title level={3} style={{ margin: 0 }}>
              Student Management
            </Title>
            <Typography.Text type="secondary">Manage student enrollment and academic information</Typography.Text>
          </Space>

          {/* Right Side - Buttons */}
          <Space style={{ display: 'flex', gap: 8 }}>
            <Button
              type="dashed"
              icon={<DeleteOutlined />}
              onClick={handleBulkDelete}
              disabled={selectedRowKeys.length === 0}
              danger
              style={{ borderRadius: 8, height: 40, }}
            >
              Delete ({selectedRowKeys.length})
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingStudent(null);
                setIsModalVisible(true);
              }}
              style={{ borderRadius: 8, height: 40, }}
            >
              Add Student
            </Button>
          </Space>
        </Flex>

        <Table<TStudent>
          columns={columns}
          dataSource={students}
          rowKey="_id"
          rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
          loading={isFetching}
          scroll={{ x: 1200 }}
          pagination={{
            current: currentPage,
            pageSize,
            total: studentsData?.meta?.total ?? students.length,
            showSizeChanger: true,
            showQuickJumper: true,
            onChange: (page, size) => {
              setCurrentPage(size !== pageSize ? 1 : page);
              setPageSize(size);
              setSelectedRowKeys([]);
            },
          }}
        />
      </Card>

      <Modal
        className="student-management-modal"
        title={editingStudent ? 'Edit Student' : 'Create Student'}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={900}
        destroyOnHidden
        styles={{ body: { maxHeight: '72vh', overflowY: 'auto', paddingRight: 8 } }}
      >
        <UniForm ref={formRef} onSubmit={handleFormSubmit} defaultValues={defaultValues}>
          <Title level={5}>Account and personal information</Title>
          <Row gutter={[16, 0]}>
            <Col span={8}>
              <UniInput type="text" name="firstName" label="First Name" required />
            </Col>
            <Col span={8}>
              <UniInput type="text" name="middleName" label="Middle Name" />
            </Col>
            <Col span={8}>
              <UniInput type="text" name="lastName" label="Last Name" required />
            </Col>
            <Col span={12}>
              <UniInput type="email" name="email" label="Email Address" required />
            </Col>
            {!editingStudent ? (
              <Col span={12}>
                <UniInput type="password" name="password" label="Password (optional)" />
              </Col>
            ) : null}
            <Col span={editingStudent ? 12 : 8}>
              <UniSelect name="gender" label="Gender" required options={genderOptions} />
            </Col>
            <Col span={editingStudent ? 12 : 8}>
              <UniSelect name="bloodGroup" label="Blood Group" required options={bloodGroupOptions} />
            </Col>
            <Col span={editingStudent ? 12 : 8}>
              <UniDatePicker name="dateOfBirth" label="Date of Birth" />
            </Col>
            <Col span={12}>
              <UniInput type="text" name="contactNo" label="Contact Number" required />
            </Col>
            <Col span={12}>
              <UniInput type="text" name="emergencyContactNo" label="Emergency Contact" required />
            </Col>
            <Col span={12}>
              <UniInput type="text" name="presentAddress" label="Present Address" required />
            </Col>
            <Col span={12}>
              <UniInput type="text" name="permanentAddress" label="Permanent Address" required />
            </Col>
          </Row>

          <Title level={5}>Academic information</Title>
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <UniSelect
                name="academicDepartment"
                label="Academic Department"
                required
                options={(departments as AcademicDepartment[]).map((department) => ({
                  value: department._id,
                  label: department.name,
                }))}
              />
            </Col>
            <Col span={12}>
              <UniSelect
                name="admissionSemester"
                label="Admission Semester"
                required
                options={(semesters as AcademicSemester[]).map((semester) => ({
                  value: semester._id,
                  label: `${semester.name} ${semester.year}`,
                }))}
              />
            </Col>
          </Row>

          <Title level={5}>Guardian information</Title>
          <Row gutter={[16, 0]}>
            <Col span={8}>
              <UniInput type="text" name="fatherName" label="Father's Name" required />
            </Col>
            <Col span={8}>
              <UniInput type="text" name="fatherOccupation" label="Father's Occupation" required />
            </Col>
            <Col span={8}>
              <UniInput type="text" name="fatherContactNo" label="Father's Contact" required />
            </Col>
            <Col span={8}>
              <UniInput type="text" name="motherName" label="Mother's Name" required />
            </Col>
            <Col span={8}>
              <UniInput type="text" name="motherOccupation" label="Mother's Occupation" required />
            </Col>
            <Col span={8}>
              <UniInput type="text" name="motherContactNo" label="Mother's Contact" required />
            </Col>
          </Row>

          <Title level={5}>Local guardian information</Title>
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <UniInput type="text" name="localGuardianName" label="Name" required />
            </Col>
            <Col span={12}>
              <UniInput type="text" name="localGuardianOccupation" label="Occupation" required />
            </Col>
            <Col span={12}>
              <UniInput type="text" name="localGuardianContactNo" label="Contact Number" required />
            </Col>
            <Col span={12}>
              <UniInput type="text" name="localGuardianAddress" label="Address" required />
            </Col>
          </Row>

          <div style={{ marginTop: 6, textAlign: 'right' }}>
            <Space size={8}>
              <Button onClick={handleModalClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                style={{ background: 'linear-gradient(135deg, #0f6ad8 0%, #0ea5e9 100%)', border: 'none' }}
              >
                {editingStudent ? 'Update' : 'Create'}
              </Button>
            </Space>
          </div>
        </UniForm>
      </Modal>
    </div>
  );
};

export default Student;
