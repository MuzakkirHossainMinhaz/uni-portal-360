import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, App, Button, Card, Col, Flex, Modal, Popconfirm, Row, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useRef, useState } from 'react';
import UniForm, { UniFormHandle } from '../../../components/form/UniForm';
import UniInput from '../../../components/form/UniInput';
import UniSelect from '../../../components/form/UniSelect';
import { bloodGroupOptions, genderOptions } from '../../../constants/global';
import { useGetAllAcademicDepartmentsQuery } from '../../../redux/features/admin/academicManagement.api';
import {
  useAddFacultyMutation,
  useDeleteFacultyMutation,
  useGetAllFacultiesQuery,
  useUpdateFacultyMutation,
} from '../../../redux/features/admin/userManagement.api';
import { useThemeMode } from '../../../theme/ThemeProvider';
import { TFaculty } from '../../../types';
import { logger } from '../../../utils/logger';

const { Title } = Typography;

type FacultyFormValues = {
  firstName: string;
  middleName?: string;
  lastName: string;
  password?: string;
  designation: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  email: string;
  contactNo: string;
  emergencyContactNo: string;
  bloodGroup: string;
  presentAddress: string;
  permanentAddress: string;
  academicDepartment: string;
};

type AcademicDepartment = {
  _id: string;
  name: string;
};

type ApiError = {
  status?: string;
  error?: string;
  data?: {
    message?: string;
    error?: Array<{ path?: string; message?: string }>;
  };
  message?: string;
};

const getFacultyName = (faculty: TFaculty) => {
  const structuredName = [faculty.name?.firstName, faculty.name?.middleName, faculty.name?.lastName]
    .filter(Boolean)
    .join(' ');

  return structuredName || faculty.fullName || faculty.id || 'N/A';
};

const sorter = (a: TFaculty, b: TFaculty) => {
  const nameA = getFacultyName(a);
  const nameB = getFacultyName(b);
  return nameA.localeCompare(nameB);
};

const Faculty = () => {
  const { message } = App.useApp();
  const { mode } = useThemeMode();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<TFaculty | null>(null);
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
  const { data: facultiesData, isLoading, isFetching, error, refetch } = useGetAllFacultiesQuery(queryParams);
  const [createFaculty] = useAddFacultyMutation();
  const [updateFaculty] = useUpdateFacultyMutation();
  const [deleteFaculty] = useDeleteFacultyMutation();
  const { data: departmentsData } = useGetAllAcademicDepartmentsQuery({});

  const faculties = facultiesData?.data || [];
  const departments = departmentsData?.data || departmentsData || [];

  const refreshTable = async (resetToFirstPage = false) => {
    if (resetToFirstPage && currentPage !== 1) {
      setCurrentPage(1);
      return;
    }

    await refetch();
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingFaculty(null);
    formRef.current?.reset();
  };

  const handleAddFaculty = () => {
    setEditingFaculty(null);
    setIsModalVisible(true);
  };

  const handleFormSubmit = async (data: FacultyFormValues) => {
    setIsSubmitting(true);
    try {
      const faculty = {
        designation: data.designation,
        name: {
          firstName: data.firstName,
          middleName: data.middleName || '',
          lastName: data.lastName,
        },
        gender: data.gender,
        dateOfBirth: data.dateOfBirth || undefined,
        email: data.email,
        contactNo: data.contactNo,
        emergencyContactNo: data.emergencyContactNo,
        bloodGroup: data.bloodGroup,
        presentAddress: data.presentAddress,
        permanentAddress: data.permanentAddress,
        academicDepartment: data.academicDepartment,
      };

      if (editingFaculty) {
        await updateFaculty({ data: { faculty }, id: editingFaculty._id }).unwrap();
        await refreshTable();
        message.success('Faculty updated successfully');
      } else {
        const fd = new FormData();
        fd.append(
          'data',
          JSON.stringify({
            password: data.password || undefined,
            faculty,
          }),
        );
        await createFaculty(fd).unwrap();
        await refreshTable(true);
        message.success('Faculty created successfully');
      }
      setIsModalVisible(false);
      setEditingFaculty(null);
      formRef.current?.reset();
    } catch (error: unknown) {
      const err = error as ApiError;
      const errMsg =
        err.status === 'TIMEOUT_ERROR'
          ? 'Request timed out. Please try again.'
          : err.data?.message || err.message || 'Something went wrong. Please try again.';

      logger.error('Faculty form submission failed', {
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

  const handleUpdate = (faculty: TFaculty) => {
    setEditingFaculty(faculty);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFaculty(id).unwrap();
      await refreshTable();
      message.success('Faculty deleted successfully');
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
      await Promise.all(selectedRowKeys.map((id) => deleteFaculty(id as string).unwrap()));
      const deletedCount = selectedRowKeys.length;
      setSelectedRowKeys([]);
      await refreshTable(true);
      message.success(`${deletedCount} faculty member${deletedCount === 1 ? '' : 's'} deleted successfully`);
    } catch (error: unknown) {
      const err = error as ApiError;
      message.error(err.data?.message || 'Bulk delete failed. Please try again.');
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  const columns: ColumnsType<TFaculty> = [
    {
      title: 'Faculty ID',
      dataIndex: 'id',
      key: 'id',
      width: 125,
      render: (id: string) => id || 'N/A',
    },
    {
      title: 'Name',
      dataIndex: 'fullName',
      key: 'name',
      sorter: sorter,
      render: (_: string, faculty: TFaculty) => getFacultyName(faculty),
    },
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
      render: (designation: string) => designation || 'N/A',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Department',
      dataIndex: ['academicDepartment', 'name'],
      key: 'academicDepartment',
      render: (deptName: string) => (
        <span
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            background: mode === 'dark' ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)',
            color: '#3b82f6',
            fontSize: '12px',
            fontWeight: 500,
          }}
        >
          {deptName || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Contact',
      dataIndex: 'contactNo',
      key: 'contactNo',
      render: (contact: string) => contact || 'N/A',
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender: string) => (gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : 'N/A'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: TFaculty) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleUpdate(record)}
            style={{ color: mode === 'dark' ? '#e5e7eb' : '#111827' }}
          />
          <Popconfirm
            title="Are you sure you want to delete this faculty?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" icon={<DeleteOutlined />} danger style={{ color: '#ef4444' }} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <Typography.Text>Loading faculties...</Typography.Text>
      </div>
    );
  }

  if (error) {
    return <Alert description="Error loading faculties" type="error" showIcon />;
  }

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
          {/* Left Side - Title and Subtitle */}
          <Space orientation="vertical" size={4}>
            <Title level={3} style={{ margin: 0, color: mode === 'dark' ? '#e5e7eb' : '#111827' }}>
              Faculty Management
            </Title>
            <Typography.Text style={{ color: mode === 'dark' ? '#9ca3af' : '#6b7280', fontSize: 14 }}>
              Manage faculty members and their academic departments
            </Typography.Text>
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
              onClick={handleAddFaculty}
              style={{ borderRadius: 8, height: 40, }}
            >
              Add Faculty
            </Button>
          </Space>
        </Flex>

        <Table<TFaculty>
          columns={columns}
          dataSource={faculties}
          rowKey="_id"
          rowSelection={rowSelection}
          loading={isFetching}
          scroll={{ x: 1200 }}
          pagination={{
            current: currentPage,
            pageSize,
            total: facultiesData?.meta?.total ?? faculties.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `${total} faculty member${total === 1 ? '' : 's'}`,
            onChange: (page, size) => {
              setCurrentPage(size !== pageSize ? 1 : page);
              setPageSize(size);
              setSelectedRowKeys([]);
            },
          }}
        />
      </Card>

      {/* Create and Edit Modal */}
      <Modal
        title={editingFaculty ? 'Edit Faculty' : 'Create Faculty'}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={700}
        destroyOnHidden={true}
      >
        <UniForm
          ref={formRef}
          onSubmit={handleFormSubmit}
          defaultValues={
            editingFaculty
              ? {
                firstName: editingFaculty.name?.firstName || '',
                middleName: editingFaculty.name?.middleName || '',
                lastName: editingFaculty.name?.lastName || '',
                designation: editingFaculty.designation || '',
                gender: editingFaculty.gender || '',
                dateOfBirth: editingFaculty.dateOfBirth?.slice(0, 10) || '',
                email: editingFaculty.email,
                contactNo: editingFaculty.contactNo || '',
                emergencyContactNo: editingFaculty.emergencyContactNo || '',
                bloodGroup: editingFaculty.bloodGroup || '',
                presentAddress: editingFaculty.presentAddress || '',
                permanentAddress: editingFaculty.permanentAddress || '',
                academicDepartment: editingFaculty.academicDepartment?._id,
              }
              : {
                firstName: '',
                middleName: '',
                lastName: '',
                password: '',
                designation: '',
                gender: '',
                dateOfBirth: '',
                email: '',
                contactNo: '',
                emergencyContactNo: '',
                bloodGroup: '',
                presentAddress: '',
                permanentAddress: '',
                academicDepartment: '',
              }
          }
        >
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
            {!editingFaculty ? (
              <Col span={12}>
                <UniInput type="password" name="password" label="Password (optional)" />
              </Col>
            ) : null}
            <Col span={editingFaculty ? 12 : 24}>
              <UniSelect
                name="academicDepartment"
                label="Academic Department"
                required
                options={(departments as AcademicDepartment[]).map((dept) => ({
                  value: dept._id,
                  label: dept.name,
                }))}
              />
            </Col>
            <Col span={12}>
              <UniInput type="text" name="designation" label="Designation" required />
            </Col>
            <Col span={12}>
              <UniSelect name="gender" label="Gender" required options={genderOptions} />
            </Col>
            <Col span={12}>
              <UniSelect name="bloodGroup" label="Blood Group" required options={bloodGroupOptions} />
            </Col>
            <Col span={12}>
              <UniInput type="date" name="dateOfBirth" label="Date of Birth" />
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
          <div style={{ marginTop: 6, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleModalClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                style={{
                  background: 'linear-gradient(135deg, #0f6ad8 0%, #0ea5e9 100%)',
                  border: 'none',
                }}
              >
                {editingFaculty ? 'Update' : 'Create'}
              </Button>
            </Space>
          </div>
        </UniForm>
      </Modal>
    </div>
  );
};

export default Faculty;
