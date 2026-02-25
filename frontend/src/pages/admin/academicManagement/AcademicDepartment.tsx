import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Col, Flex, message, Modal, Popconfirm, Row, Space, Table, Typography } from 'antd';
import { useEffect, useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import UniForm from '../../../components/form/UniForm';
import UniInput from '../../../components/form/UniInput';
import UniSelect from '../../../components/form/UniSelect';
import {
  useCreateAcademicDepartmentMutation,
  useDeleteAcademicDepartmentMutation,
  useGetAllAcademicDepartmentsQuery,
  useGetAllAcademicFacultiesQuery,
  useUpdateAcademicDepartmentMutation,
} from '../../../redux/features/admin/academicManagement.api';
import { useThemeMode } from '../../../theme/ThemeProvider';

const { Title } = Typography;

interface AcademicDepartment {
  _id: string;
  name: string;
  description?: string;
  academicFaculty: {
    _id: string;
    name: string;
  };
}

const sorter = (a: any, b: any) => {
  const nameA = a.name || '';
  const nameB = b.name || '';
  return nameA.localeCompare(nameB);
};

const AcademicDepartment = () => {
  const { mode } = useThemeMode();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<AcademicDepartment | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // API hooks
  const { data: departmentsData, isLoading, error } = useGetAllAcademicDepartmentsQuery({});
  const [createAcademicDepartment] = useCreateAcademicDepartmentMutation();
  const [updateAcademicDepartment] = useUpdateAcademicDepartmentMutation();
  const [deleteAcademicDepartment] = useDeleteAcademicDepartmentMutation();
  const { data: facultiesData } = useGetAllAcademicFacultiesQuery({});

  const departments = departmentsData?.data || departmentsData || [];
  const faculties = facultiesData?.data || facultiesData || [];

  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingDepartment(null);
  };

  const handleAddDepartment = () => {
    setEditingDepartment(null);
    setIsModalVisible(true);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingDepartment) {
        // Update logic
        await updateAcademicDepartment({
          data,
          id: editingDepartment._id,
        }).unwrap();
        message.success('Department updated successfully');
      } else {
        // Create logic
        await createAcademicDepartment(data).unwrap();
        message.success('Department created successfully');
      }
      setIsModalVisible(false);
      setEditingDepartment(null);
    } catch (error) {
      message.error('Operation failed. Please try again.');
    }
  };

  const handleUpdate = (department: AcademicDepartment) => {
    setEditingDepartment(department);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAcademicDepartment(id).unwrap();
      message.success('Department deleted successfully');
    } catch (error) {
      message.error('Delete failed. Please try again.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select items to delete');
      return;
    }
    try {
      await Promise.all(selectedRowKeys.map((id) => deleteAcademicDepartment(id as string).unwrap()));
      setSelectedRowKeys([]);
      message.success(`${selectedRowKeys.length} department(s) deleted successfully`);
    } catch (error) {
      message.error('Bulk delete failed. Please try again.');
    }
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  useEffect(() => {
    if (!isModalVisible) {
      setEditingDepartment(null);
    }
  }, [isModalVisible]);

  const columns: ColumnsType<AcademicDepartment> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: sorter,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Academic Faculty',
      dataIndex: ['academicFaculty', 'name'],
      key: 'academicFaculty',
      render: (facultyName: string) => (
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
          {facultyName || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: AcademicDepartment) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleUpdate(record)}
            style={{ color: mode === 'dark' ? '#e5e7eb' : '#111827' }}
          />
          <Popconfirm
            title="Are you sure you want to delete this department?"
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
        <Typography.Text>Loading academic departments...</Typography.Text>
      </div>
    );
  }

  if (error) {
    return <Alert description="Error loading academic departments" type="error" showIcon />;
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
              Academic Departments
            </Title>
            <Typography.Text style={{ color: mode === 'dark' ? '#9ca3af' : '#6b7280', fontSize: 14 }}>
              Manage academic departments and their details
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
              style={{
                borderRadius: 8,
                height: 40,
              }}
            >
              Delete ({selectedRowKeys.length})
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddDepartment}
              style={{
                borderRadius: 8,
                height: 40,
              }}
            >
              Add Department
            </Button>
          </Space>
        </Flex>

        <Table
          columns={columns}
          dataSource={departments || []}
          rowKey="_id"
          rowSelection={rowSelection}
          style={{
            background: mode === 'dark' ? 'rgba(30,41,59,0.8)' : 'rgba(248,250,252,0.8)',
            borderRadius: 12,
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            style: { marginRight: 8 },
          }}
        />
      </Card>

      {/* Create and Edit Modal */}
      <Modal
        title={editingDepartment ? 'Edit Department' : 'Create Department'}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={600}
        destroyOnHidden={true}
      >
        <UniForm
          onSubmit={handleFormSubmit}
          defaultValues={
            editingDepartment
              ? {
                  name: editingDepartment.name,
                  description: editingDepartment.description || '',
                  academicFaculty: editingDepartment.academicFaculty?._id,
                }
              : {
                  name: '',
                  description: '',
                  academicFaculty: '',
                }
          }
        >
          <Row gutter={[16, 0]}>
            <Col span={24}>
              <UniInput type="text" name="name" label="Department Name" required />
            </Col>
            <Col span={24}>
              <UniInput type="text" name="description" label="Description" />
            </Col>
            <Col span={24}>
              <UniSelect
                name="academicFaculty"
                label="Academic Faculty"
                required
                options={faculties.map((faculty: any) => ({
                  value: faculty._id,
                  label: faculty.name,
                }))}
              />
            </Col>
          </Row>
          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleModalClose}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  background: 'linear-gradient(135deg, #0f6ad8 0%, #0ea5e9 100%)',
                  border: 'none',
                }}
              >
                {editingDepartment ? 'Update' : 'Create'}
              </Button>
            </Space>
          </div>
        </UniForm>
      </Modal>
    </div>
  );
};

export default AcademicDepartment;
