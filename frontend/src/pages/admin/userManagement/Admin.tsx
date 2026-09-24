import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Col, Flex, message, Modal, Popconfirm, Row, Select, Space, Table, Typography } from 'antd';
import { useRef, useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { Controller } from 'react-hook-form';
import UniForm, { UniFormHandle } from '../../../components/form/UniForm';
import UniInput from '../../../components/form/UniInput';
import {
  useGetAllAdminsQuery,
  useAddAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
} from '../../../redux/features/admin/userManagement.api';
import { useThemeMode } from '../../../theme/ThemeProvider';

const { Title } = Typography;
const { Option } = Select;

interface Admin {
  _id: string;
  name: string;
  email: string;
  role: string;
  contactNo?: string;
  address?: string;
  profileImg?: string;
}

const sorter = (a: any, b: any) => {
  const nameA = a.name || '';
  const nameB = b.name || '';
  return nameA.localeCompare(nameB);
};

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
  const { mode } = useThemeMode();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<UniFormHandle>(null);

  const { data: adminsData, isLoading, error } = useGetAllAdminsQuery(undefined);
  const [createAdmin] = useAddAdminMutation();
  const [updateAdmin] = useUpdateAdminMutation();
  const [deleteAdmin] = useDeleteAdminMutation();

  const admins = adminsData?.data || adminsData || [];

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

  const handleFormSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      if (editingAdmin) {
        await updateAdmin({ data: { admin: formData }, id: editingAdmin._id }).unwrap();
        message.success('Admin updated successfully');
        setIsModalVisible(false);
        setEditingAdmin(null);
        formRef.current?.reset();
      } else {
        // Backend expects multipart/form-data with a `data` JSON string field
        const payload = {
          password: formData.password || undefined,
          admin: {
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
            bloogGroup: formData.bloogGroup,
            presentAddress: formData.presentAddress,
            permanentAddress: formData.permanentAddress,
          },
        };

        const fd = new FormData();
        fd.append('data', JSON.stringify(payload));
        await createAdmin(fd).unwrap();
        message.success('Admin created successfully!');
        // Only reset + close on success
        setIsModalVisible(false);
        setEditingAdmin(null);
        formRef.current?.reset();
      }
    } catch (err: any) {
      // Keep modal open, show error — do NOT reset form
      const errMsg =
        err?.data?.message ||
        err?.data?.error?.[0]?.message ||
        err?.message ||
        'Something went wrong. Please try again.';
      message.error(errMsg, 5);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = (admin: Admin) => {
    setEditingAdmin(admin);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAdmin(id).unwrap();
      message.success('Admin deleted successfully');
    } catch (err: any) {
      message.error(err?.data?.message || 'Delete failed. Please try again.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select items to delete');
      return;
    }
    try {
      await Promise.all(selectedRowKeys.map((id) => deleteAdmin(id as string).unwrap()));
      setSelectedRowKeys([]);
      message.success(`${selectedRowKeys.length} admin(s) deleted successfully`);
    } catch (err: any) {
      message.error(err?.data?.message || 'Bulk delete failed. Please try again.');
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  const columns: ColumnsType<Admin> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <span
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            background: mode === 'dark' ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.1)',
            color: '#22c55e',
            fontSize: '12px',
            fontWeight: 500,
          }}
        >
          {role || 'Admin'}
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
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Admin) => (
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
          <Space direction="vertical" size={4}>
            <Title level={3} style={{ margin: 0, color: mode === 'dark' ? '#e5e7eb' : '#111827' }}>
              Admin Management
            </Title>
            <Typography.Text style={{ color: mode === 'dark' ? '#9ca3af' : '#6b7280', fontSize: 14 }}>
              Manage system administrators and their permissions
            </Typography.Text>
          </Space>

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

        <Table
          columns={columns}
          dataSource={admins}
          rowKey="_id"
          rowSelection={rowSelection}
          pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true, style: { marginRight: 8 } }}
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
              ? { name: editingAdmin.name, email: editingAdmin.email, contactNo: editingAdmin.contactNo || '' }
              : {
                  firstName: '',
                  middleName: '',
                  lastName: '',
                  email: '',
                  password: '',
                  designation: '',
                  gender: '',
                  bloogGroup: '',
                  contactNo: '',
                  emergencyContactNo: '',
                  presentAddress: '',
                  permanentAddress: '',
                  dateOfBirth: '',
                }
          }
        >
          {editingAdmin ? (
            <Row gutter={[16, 0]}>
              <Col span={24}>
                <UniInput type="text" name="name" label="Full Name" required />
              </Col>
              <Col span={24}>
                <UniInput type="email" name="email" label="Email Address" required />
              </Col>
              <Col span={12}>
                <UniInput type="text" name="contactNo" label="Contact Number" />
              </Col>
            </Row>
          ) : (
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
              <Col span={12}>
                <UniInput type="password" name="password" label="Password (optional)" />
              </Col>
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
                  name="bloogGroup"
                  label="Blood Group"
                  required
                  options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => ({
                    value: b,
                    label: b,
                  }))}
                />
              </Col>
              <Col span={12}>
                <UniInput type="text" name="dateOfBirth" label="Date of Birth (YYYY-MM-DD)" />
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
          )}
          <div style={{ marginTop: 24, textAlign: 'right' }}>
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
