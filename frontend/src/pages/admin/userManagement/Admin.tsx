import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, App, Button, Card, Col, Flex, Modal, Popconfirm, Row, Select, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import UniForm, { UniFormHandle } from '../../../components/form/UniForm';
import UniInput from '../../../components/form/UniInput';
import {
  useAddAdminMutation,
  useDeleteAdminMutation,
  useGetAllAdminsQuery,
  useUpdateAdminMutation,
} from '../../../redux/features/admin/userManagement.api';
import { useThemeMode } from '../../../theme/ThemeProvider';
import { TAdmin } from '../../../types';
import { logger } from '../../../utils/logger';

const { Title } = Typography;
const { Option } = Select;

type AdminFormValues = {
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
};

type ApiError = {
  status?: string;
  error?: string;
  data?: {
    message?: string;
    error?: Array<{
      path?: string;
      message?: string;
    }>;
  };
  message?: string;
};

const getAdminName = (admin: TAdmin) => {
  const structuredName = [admin.name?.firstName, admin.name?.middleName, admin.name?.lastName]
    .filter(Boolean)
    .join(' ');

  return structuredName || admin.fullName || admin.id || 'N/A';
};

const sorter = (a: TAdmin, b: TAdmin) => getAdminName(a).localeCompare(getAdminName(b));

// Controlled Select that integrates with react-hook-form via Controller
const UniSelect = ({
  name,
  label,
  options,
  required,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  required?: boolean;
}) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
      {required && <span style={{ color: '#ff4d4f', marginRight: 4 }}>*</span>}
      {label}
    </label>
    <Controller
      name={name}
      render={({ field }) => (
        <Select
          {...field}
          value={field.value || undefined}
          style={{ width: '100%' }}
          size="large"
          placeholder={`Select ${label}`}
          allowClear
        >
          {options.map((opt) => (
            <Option key={opt.value} value={opt.value}>
              {opt.label}
            </Option>
          ))}
        </Select>
      )}
    />
  </div>
);

const Admin = () => {
  const { message } = App.useApp();
  const { mode } = useThemeMode();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<TAdmin | null>(null);
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
  const { data: adminsData, isLoading, isFetching, error, refetch } = useGetAllAdminsQuery(queryParams);
  const [createAdmin] = useAddAdminMutation();
  const [updateAdmin] = useUpdateAdminMutation();
  const [deleteAdmin] = useDeleteAdminMutation();

  const admins = adminsData?.data ?? [];

  const refreshTable = async (resetToFirstPage = false) => {
    if (resetToFirstPage && currentPage !== 1) {
      setCurrentPage(1);
      return;
    }

    await refetch();
  };

  // Close modal and reset form
  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingAdmin(null);
    formRef.current?.reset();
  };

  const handleAddAdmin = () => {
    setEditingAdmin(null);
    setIsModalVisible(true);
  };

  const handleFormSubmit = async (formData: AdminFormValues) => {
    setIsSubmitting(true);
    try {
      const admin = {
        designation: formData.designation,
        name: {
          firstName: formData.firstName,
          middleName: formData.middleName || '',
          lastName: formData.lastName,
        },
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth || undefined,
        email: formData.email,
        contactNo: formData.contactNo,
        emergencyContactNo: formData.emergencyContactNo,
        bloodGroup: formData.bloodGroup,
        presentAddress: formData.presentAddress,
        permanentAddress: formData.permanentAddress,
      };

      if (editingAdmin) {
        await updateAdmin({ data: { admin }, id: editingAdmin._id }).unwrap();
        await refreshTable();
        message.success('Admin updated successfully');
        setIsModalVisible(false);
        setEditingAdmin(null);
        formRef.current?.reset();
      } else {
        // Backend expects multipart/form-data with a `data` JSON string field
        const payload = {
          password: formData.password || undefined,
          admin,
        };

        const fd = new FormData();
        fd.append('data', JSON.stringify(payload));
        await createAdmin(fd).unwrap();
        await refreshTable(true);
        message.success('Admin created successfully!');
        // Only reset + close on success
        setIsModalVisible(false);
        setEditingAdmin(null);
        formRef.current?.reset();
      }
    } catch (error: unknown) {
      // Keep modal open, show error — do NOT reset form
      const err = error as ApiError;
      const errMsg =
        err.status === 'TIMEOUT_ERROR'
          ? 'Request timed out. Please try again.'
          : err.data?.message || err.message || 'Something went wrong. Please try again.';

      logger.error('Admin form submission failed', {
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

  const handleUpdate = (admin: TAdmin) => {
    setEditingAdmin(admin);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAdmin(id).unwrap();
      await refreshTable();
      message.success('Admin deleted successfully');
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
      await Promise.all(selectedRowKeys.map((id) => deleteAdmin(id as string).unwrap()));
      const deletedCount = selectedRowKeys.length;
      setSelectedRowKeys([]);
      await refreshTable(true);
      message.success(`${deletedCount} admin(s) deleted successfully`);
    } catch (error: unknown) {
      const err = error as ApiError;
      message.error(err.data?.message || 'Bulk delete failed. Please try again.');
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  const columns: ColumnsType<TAdmin> = [
    {
      title: 'Admin ID',
      dataIndex: 'id',
      key: 'id',
      width: 125,
      render: (id: string) => id || 'N/A',
    },
    {
      title: 'Name',
      key: 'name',
      sorter,
      render: (_value, admin) => getAdminName(admin),
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
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender: string) => (gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : 'N/A'),
    },
    {
      title: 'Contact',
      dataIndex: 'contactNo',
      key: 'contactNo',
      render: (contact: string) => contact || 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: TAdmin) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleUpdate(record)}
            style={{ color: mode === 'dark' ? '#e5e7eb' : '#111827' }}
          />
          <Popconfirm
            title="Are you sure you want to delete this admin?"
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
        <Typography.Text>Loading admins...</Typography.Text>
      </div>
    );
  }

  if (error) {
    return <Alert description="Error loading admins" type="error" showIcon />;
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
          <Space orientation="vertical" size={4}>
            <Title level={3} style={{ margin: 0, color: mode === 'dark' ? '#e5e7eb' : '#111827' }}>
              Admin Management
            </Title>
            <Typography.Text style={{ color: mode === 'dark' ? '#9ca3af' : '#6b7280', fontSize: 14 }}>
              Manage Admin profiles. The system-owner Super Admin is listed in All Accounts &amp; Roles.
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
              style={{ borderRadius: 8, height: 40 }}
            >
              Delete ({selectedRowKeys.length})
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddAdmin}
              style={{ borderRadius: 8, height: 40 }}
            >
              Add Admin
            </Button>
          </Space>
        </Flex>

        <Table<TAdmin>
          columns={columns}
          dataSource={admins}
          rowKey="_id"
          rowSelection={rowSelection}
          loading={isFetching}
          scroll={{ x: 1050 }}
          pagination={{
            current: currentPage,
            pageSize,
            total: adminsData?.meta?.total ?? admins.length,
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

      {/* Create / Edit Modal */}
      <Modal
        title={editingAdmin ? 'Edit Admin' : 'Create Admin'}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={700}
        destroyOnHidden
      >
        <UniForm
          ref={formRef}
          onSubmit={handleFormSubmit}
          defaultValues={
            editingAdmin
              ? {
                firstName: editingAdmin.name?.firstName || '',
                middleName: editingAdmin.name?.middleName || '',
                lastName: editingAdmin.name?.lastName || '',
                designation: editingAdmin.designation || '',
                gender: editingAdmin.gender || '',
                dateOfBirth: editingAdmin.dateOfBirth?.slice(0, 10) || '',
                email: editingAdmin.email,
                contactNo: editingAdmin.contactNo || '',
                emergencyContactNo: editingAdmin.emergencyContactNo || '',
                bloodGroup: editingAdmin.bloodGroup || '',
                presentAddress: editingAdmin.presentAddress || '',
                permanentAddress: editingAdmin.permanentAddress || '',
              }
              : {
                firstName: '',
                middleName: '',
                lastName: '',
                email: '',
                password: '',
                designation: '',
                gender: '',
                bloodGroup: '',
                contactNo: '',
                emergencyContactNo: '',
                presentAddress: '',
                permanentAddress: '',
                dateOfBirth: '',
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
              <UniInput type="email" name="email" label="Email" required />
            </Col>
            {!editingAdmin ? (
              <Col span={12}>
                <UniInput type="password" name="password" label="Password (optional)" />
              </Col>
            ) : null}
            <Col span={12}>
              <UniInput type="text" name="designation" label="Designation" required />
            </Col>
            <Col span={12}>
              <UniSelect
                name="gender"
                label="Gender"
                required
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]}
              />
            </Col>
            <Col span={12}>
              <UniSelect
                name="bloodGroup"
                label="Blood Group"
                required
                options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => ({
                  value: b,
                  label: b,
                }))}
              />
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
                style={{ background: 'linear-gradient(135deg, #0f6ad8 0%, #0ea5e9 100%)', border: 'none' }}
              >
                {editingAdmin ? 'Update' : 'Create'}
              </Button>
            </Space>
          </div>
        </UniForm>
      </Modal>
    </div>
  );
};

export default Admin;
