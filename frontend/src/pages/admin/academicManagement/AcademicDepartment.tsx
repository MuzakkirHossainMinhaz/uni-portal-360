import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, App, Button, Card, Col, Flex, Modal, Popconfirm, Row, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
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
import type { TAcademicDepartment } from '../../../types';

const { Title } = Typography;

type DepartmentFormValues = { name: string; description?: string; academicFaculty: string };

const AcademicDepartment = () => {
  const { message } = App.useApp();
  const { mode } = useThemeMode();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<TAcademicDepartment | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const queryParams = useMemo(() => [
    { name: 'page', value: currentPage },
    { name: 'limit', value: pageSize },
  ], [currentPage, pageSize]);

  // API hooks
  const { data: departmentsData, isLoading, isFetching, error } = useGetAllAcademicDepartmentsQuery(queryParams);
  const [createAcademicDepartment] = useCreateAcademicDepartmentMutation();
  const [updateAcademicDepartment] = useUpdateAcademicDepartmentMutation();
  const [deleteAcademicDepartment] = useDeleteAcademicDepartmentMutation();
  const { data: facultiesData } = useGetAllAcademicFacultiesQuery([{ name: 'limit', value: 100 }]);

  const departments = departmentsData?.data ?? [];
  const faculties = facultiesData?.data ?? [];

  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingDepartment(null);
  };

  const handleAddDepartment = () => {
    setEditingDepartment(null);
    setIsModalVisible(true);
  };

  const handleFormSubmit = async (data: DepartmentFormValues) => {
    try {
      if (editingDepartment) {
        await updateAcademicDepartment({
          data,
          id: editingDepartment._id,
        }).unwrap();
        message.success('Department updated successfully');
      } else {
        await createAcademicDepartment(data).unwrap();
        setCurrentPage(1);
        message.success('Department created successfully');
      }
      setIsModalVisible(false);
      setEditingDepartment(null);
    } catch {
      message.error('Operation failed. Please try again.');
    }
  };

  const handleUpdate = (department: TAcademicDepartment) => {
    setEditingDepartment(department);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAcademicDepartment(id).unwrap();
      message.success('Department deleted successfully');
    } catch {
      message.error('Delete failed. Please try again.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select items to delete');
      return;
    }
    try {
      await Promise.all(selectedRowKeys.map((id) => deleteAcademicDepartment(String(id)).unwrap()));
      setSelectedRowKeys([]);
      setCurrentPage(1);
      message.success(`${selectedRowKeys.length} department(s) deleted successfully`);
    } catch {
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

  const columns: ColumnsType<TAcademicDepartment> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
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
      render: (_value, record) => (
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

        <Table<TAcademicDepartment>
          columns={columns}
          dataSource={departments}
          rowKey="_id"
          rowSelection={rowSelection}
          loading={isFetching}
          scroll={{ x: 850 }}
          pagination={{
            current: currentPage,
            pageSize,
            total: departmentsData?.meta?.total ?? departments.length,
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
                options={faculties.map((faculty) => ({
                  value: faculty._id,
                  label: faculty.name,
                }))}
              />
            </Col>
          </Row>
          <div style={{ marginTop: 6, textAlign: 'right' }}>
            <Space size={8}>
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
