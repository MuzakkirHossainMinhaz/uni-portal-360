import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Col, Flex, message, Modal, Popconfirm, Row, Space, Table, Typography } from 'antd';
import { useEffect, useState } from 'react';
import UniForm from '../../../components/form/UniForm';
import UniInput from '../../../components/form/UniInput';
import {
  useCreateAcademicFacultyMutation,
  useDeleteAcademicFacultyMutation,
  useGetAllAcademicFacultiesQuery,
  useUpdateAcademicFacultyMutation,
} from '../../../redux/features/admin/academicManagement.api';
import { useThemeMode } from '../../../theme/ThemeProvider';

const { Title } = Typography;

interface AcademicFaculty {
  _id: string;
  name: string;
  description?: string;
}

const sorter = (a: any, b: any) => {
  const nameA = a.name || '';
  const nameB = b.name || '';
  return nameA.localeCompare(nameB);
};

const AcademicFaculty = () => {
  const { mode } = useThemeMode();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<AcademicFaculty | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // API hooks
  const { data: facultiesData, isLoading, error } = useGetAllAcademicFacultiesQuery({});
  const [createAcademicFaculty] = useCreateAcademicFacultyMutation();
  const [updateAcademicFaculty] = useUpdateAcademicFacultyMutation();
  const [deleteAcademicFaculty] = useDeleteAcademicFacultyMutation();

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingFaculty) {
        // Update logic
        await updateAcademicFaculty({
          data,
          id: editingFaculty._id,
        }).unwrap();
        message.success('Faculty updated successfully');
      } else {
        // Create logic
        await createAcademicFaculty(data).unwrap();
        message.success('Faculty created successfully');
      }
      setIsModalVisible(false);
      setEditingFaculty(null);
    } catch (error) {
      message.error('Operation failed. Please try again.');
    }
  };

  const handleUpdate = (faculty: AcademicFaculty) => {
    setEditingFaculty(faculty);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingFaculty(null);
  };

  const handleAddFaculty = () => {
    setEditingFaculty(null);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAcademicFaculty(id).unwrap();
      message.success('Faculty deleted successfully');
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
      await Promise.all(selectedRowKeys.map((id) => deleteAcademicFaculty(id as string).unwrap()));
      setSelectedRowKeys([]);
      message.success(`${selectedRowKeys.length} faculty(es) deleted successfully`);
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
      setEditingFaculty(null);
    }
  }, [isModalVisible]);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      sorter: sorter,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: AcademicFaculty) => (
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
        <Typography.Text>Loading academic faculties...</Typography.Text>
      </div>
    );
  }

  if (error) {
    return <Alert description="Error loading academic faculties" type="error" showIcon />;
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
              Academic Faculties
            </Title>
            <Typography.Text style={{ color: mode === 'dark' ? '#9ca3af' : '#6b7280', fontSize: 14 }}>
              Manage academic faculties and their details
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
              onClick={handleAddFaculty}
              style={{
                borderRadius: 8,
                height: 40,
              }}
            >
              Add Faculty
            </Button>
          </Space>
        </Flex>

        <Table
          columns={columns}
          dataSource={facultiesData || []}
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
        title={editingFaculty ? 'Edit Faculty' : 'Create Faculty'}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={600}
        destroyOnClose={true}
      >
        <UniForm
          onSubmit={handleFormSubmit}
          defaultValues={
            editingFaculty
              ? {
                  name: editingFaculty.name,
                  description: editingFaculty.description,
                }
              : {
                  name: '',
                  description: '',
                }
          }
        >
          <Row gutter={[16, 0]}>
            <Col span={24}>
              <UniInput type="text" name="name" label="Faculty Name" required />
            </Col>
            <Col span={24}>
              <UniInput type="text" name="description" label="Description" />
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
                {editingFaculty ? 'Update' : 'Create'}
              </Button>
            </Space>
          </div>
        </UniForm>
      </Modal>
    </div>
  );
};

export default AcademicFaculty;
