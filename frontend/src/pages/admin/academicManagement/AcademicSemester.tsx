import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Col, Flex, message, Modal, Popconfirm, Row, Space, Table, Typography } from 'antd';
import { useEffect, useState } from 'react';
import UniForm from '../../../components/form/UniForm';
import UniInput from '../../../components/form/UniInput';
import UniSelect from '../../../components/form/UniSelect';
import { monthOptions } from '../../../constants/global';
import { semesterOptions } from '../../../constants/semester';
import {
  useCreateAcademicSemesterMutation,
  useDeleteAcademicSemesterMutation,
  useGetAllAcademicSemestersQuery,
  useUpdateAcademicSemesterMutation,
} from '../../../redux/features/admin/academicManagement.api';
import { useThemeMode } from '../../../theme/ThemeProvider';

const { Title } = Typography;

interface AcademicSemester {
  _id: string;
  name: string;
  code: string;
  year: string;
  startMonth: string;
  endMonth: string;
}

const sorter = (a: any, b: any) => {
  const nameA = a.name || '';
  const nameB = b.name || '';
  return nameA.localeCompare(nameB);
};

const AcademicSemester = () => {
  const { mode } = useThemeMode();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSemester, setEditingSemester] = useState<AcademicSemester | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // API hooks
  const { data: semestersData, isLoading, error } = useGetAllAcademicSemestersQuery({});
  const [createAcademicSemester] = useCreateAcademicSemesterMutation();
  const [updateAcademicSemester] = useUpdateAcademicSemesterMutation();
  const [deleteAcademicSemester] = useDeleteAcademicSemesterMutation();

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingSemester) {
        // Update logic
        await updateAcademicSemester({
          data: {
            ...data,
            name: semesterOptions.find((option) => option.value === data.name)?.label || data.name,
            code: semesterOptions.find((option) => option.value === data.name)?.value || data.name,
          },
          id: editingSemester._id,
        }).unwrap();
        message.success('Semester updated successfully');
      } else {
        // Create logic
        await createAcademicSemester({
          ...data,
          name: semesterOptions.find((option) => option.value === data.name)?.label || data.name,
          code: semesterOptions.find((option) => option.value === data.name)?.value || data.name,
        }).unwrap();
        message.success('Semester created successfully');
      }
      setIsModalVisible(false);
      setEditingSemester(null);
    } catch (error) {
      message.error('Operation failed. Please try again.');
    }
  };

  const handleUpdate = (semester: AcademicSemester) => {
    setEditingSemester(semester);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingSemester(null);
  };

  const handleAddSemester = () => {
    setEditingSemester(null);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAcademicSemester(id).unwrap();
      message.success('Semester deleted successfully');
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
      await Promise.all(selectedRowKeys.map((id) => deleteAcademicSemester(id as string).unwrap()));
      setSelectedRowKeys([]);
      message.success(`${selectedRowKeys.length} semester(s) deleted successfully`);
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
      setEditingSemester(null);
    }
  }, [isModalVisible]);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      sorter: sorter,
    },
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
      sorter: sorter,
    },
    {
      title: 'Start Month',
      dataIndex: 'startMonth',
      key: 'startMonth',
      sorter: sorter,
    },
    {
      title: 'End Month',
      dataIndex: 'endMonth',
      key: 'endMonth',
      sorter: sorter,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: AcademicSemester) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleUpdate(record)}
            style={{ color: mode === 'dark' ? '#e5e7eb' : '#111827' }}
          />
          <Popconfirm
            title="Are you sure you want to delete this semester?"
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
        <Typography.Text>Loading academic semesters...</Typography.Text>
      </div>
    );
  }

  if (error) {
    return <Alert description="Error loading academic semesters" type="error" showIcon />;
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
              Academic Semesters
            </Title>
            <Typography.Text style={{ color: mode === 'dark' ? '#9ca3af' : '#6b7280', fontSize: 14 }}>
              Manage academic semesters and their schedules
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
              onClick={handleAddSemester}
              style={{
                borderRadius: 8,
                height: 40,
              }}
            >
              Add Semester
            </Button>
          </Space>
        </Flex>

        <Table
          columns={columns}
          dataSource={semestersData || []}
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
        title={editingSemester ? 'Edit Semester' : 'Create Semester'}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={600}
        destroyOnClose={true}
      >
        <UniForm
          onSubmit={handleFormSubmit}
          defaultValues={
            editingSemester
              ? {
                  name:
                    semesterOptions.find((option) => option.label === editingSemester.name)?.value ||
                    editingSemester.code,
                  code: editingSemester.code,
                  year: editingSemester.year,
                  startMonth: editingSemester.startMonth,
                  endMonth: editingSemester.endMonth,
                }
              : {
                  name: '',
                  code: '',
                  year: '',
                  startMonth: '',
                  endMonth: '',
                }
          }
        >
          <Row gutter={[16, 0]}>
            <Col span={24}>
              <UniSelect name="name" label="Semester Name" options={semesterOptions} />
            </Col>
            <Col span={24}>
              <UniInput type="text" name="year" label="Year" required />
            </Col>
            <Col span={12}>
              <UniSelect name="startMonth" label="Start Month" options={monthOptions} />
            </Col>
            <Col span={12}>
              <UniSelect name="endMonth" label="End Month" options={monthOptions} />
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
                {editingSemester ? 'Update' : 'Create'}
              </Button>
            </Space>
          </div>
        </UniForm>
      </Modal>
    </div>
  );
};

export default AcademicSemester;
