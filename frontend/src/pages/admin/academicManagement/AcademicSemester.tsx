import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, App, Button, Card, Col, Flex, Modal, Popconfirm, Row, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
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
import type { TAcademicSemester } from '../../../types';

const { Title } = Typography;

type SemesterFormValues = Pick<TAcademicSemester, 'name' | 'year' | 'startMonth' | 'endMonth'>;
const monthOrder = new Map(monthOptions.map((month, index) => [month.value, index]));

const AcademicSemester = () => {
  const { message } = App.useApp();
  const { mode } = useThemeMode();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSemester, setEditingSemester] = useState<TAcademicSemester | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const queryParams = useMemo(() => [
    { name: 'page', value: currentPage },
    { name: 'limit', value: pageSize },
  ], [currentPage, pageSize]);

  // API hooks
  const { data: semestersData, isLoading, isFetching, error } = useGetAllAcademicSemestersQuery(queryParams);
  const [createAcademicSemester] = useCreateAcademicSemesterMutation();
  const [updateAcademicSemester] = useUpdateAcademicSemesterMutation();
  const [deleteAcademicSemester] = useDeleteAcademicSemesterMutation();

  const semesters = semestersData?.data ?? [];

  const handleFormSubmit = async (data: SemesterFormValues) => {
    try {
      const semester = {
        ...data,
        name: semesterOptions.find((option) => option.value === data.name)?.label || data.name,
        code: semesterOptions.find((option) => option.value === data.name)?.value || data.name,
      };
      if (editingSemester) {
        await updateAcademicSemester({
          data: semester,
          id: editingSemester._id,
        }).unwrap();
        message.success('Semester updated successfully');
      } else {
        await createAcademicSemester(semester).unwrap();
        setCurrentPage(1);
        message.success('Semester created successfully');
      }
      setIsModalVisible(false);
      setEditingSemester(null);
    } catch {
      message.error('Operation failed. Please try again.');
    }
  };

  const handleUpdate = (semester: TAcademicSemester) => {
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
      await Promise.all(selectedRowKeys.map((id) => deleteAcademicSemester(String(id)).unwrap()));
      setSelectedRowKeys([]);
      setCurrentPage(1);
      message.success(`${selectedRowKeys.length} semester(s) deleted successfully`);
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

  const columns: ColumnsType<TAcademicSemester> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
      sorter: (a, b) => a.year.localeCompare(b.year),
    },
    {
      title: 'Start Month',
      dataIndex: 'startMonth',
      key: 'startMonth',
      sorter: (a, b) => (monthOrder.get(a.startMonth) ?? 0) - (monthOrder.get(b.startMonth) ?? 0),
    },
    {
      title: 'End Month',
      dataIndex: 'endMonth',
      key: 'endMonth',
      sorter: (a, b) => (monthOrder.get(a.endMonth) ?? 0) - (monthOrder.get(b.endMonth) ?? 0),
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

        <Table<TAcademicSemester>
          columns={columns}
          dataSource={semesters}
          rowKey="_id"
          rowSelection={rowSelection}
          loading={isFetching}
          scroll={{ x: 850 }}
          pagination={{
            current: currentPage,
            pageSize,
            total: semestersData?.meta?.total ?? semesters.length,
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
        title={editingSemester ? 'Edit Semester' : 'Create Semester'}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={600}
        destroyOnHidden={true}
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
