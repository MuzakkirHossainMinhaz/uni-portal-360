import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Col, Flex, message, Modal, Popconfirm, Row, Space, Table, Typography } from 'antd';
import { useEffect, useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import UniForm from '../../../components/form/UniForm';
import UniInput from '../../../components/form/UniInput';
import {
  useGetAllMembersQuery,
  useAddMemberMutation,
  useUpdateMemberMutation,
  useDeleteMemberMutation,
} from '../../../redux/features/admin/userManagement.api';
import { useThemeMode } from '../../../theme/ThemeProvider';

const { Title } = Typography;

interface Member {
  _id: string;
  name: string;
  email: string;
  role: string;
  contactNo?: string;
  address?: string;
  profileImg?: string;
  membershipType?: string;
  joinDate?: string;
  isDeleted?: boolean;
}

const sorter = (a: any, b: any) => {
  const nameA = a.name || '';
  const nameB = b.name || '';
  return nameA.localeCompare(nameB);
};

const Member = () => {
  const { mode } = useThemeMode();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // API hooks
  const { data: membersData, isLoading, error } = useGetAllMembersQuery({});
  const [createMember] = useAddMemberMutation();
  const [updateMember] = useUpdateMemberMutation();
  const [deleteMember] = useDeleteMemberMutation();

  const members = membersData?.data || membersData || [];

  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingMember(null);
  };

  const handleAddMember = () => {
    setEditingMember(null);
    setIsModalVisible(true);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingMember) {
        // Update logic
        await updateMember({
          data,
          id: editingMember._id,
        }).unwrap();
        message.success('Member updated successfully');
      } else {
        // Create logic
        await createMember(data).unwrap();
        message.success('Member created successfully');
      }
      setIsModalVisible(false);
      setEditingMember(null);
    } catch (error) {
      message.error('Operation failed. Please try again.');
    }
  };

  const handleUpdate = (member: Member) => {
    setEditingMember(member);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMember(id).unwrap();
      message.success('Member deleted successfully');
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
      await Promise.all(selectedRowKeys.map((id) => deleteMember(id as string).unwrap()));
      setSelectedRowKeys([]);
      message.success(`${selectedRowKeys.length} member(s) deleted successfully`);
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
      setEditingMember(null);
    }
  }, [isModalVisible]);

  const columns: ColumnsType<Member> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: sorter,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Membership Type',
      dataIndex: 'membershipType',
      key: 'membershipType',
      render: (type: string) => (
        <span
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            background: mode === 'dark' ? 'rgba(168,85,247,0.2)' : 'rgba(168,85,247,0.1)',
            color: '#a855f7',
            fontSize: '12px',
            fontWeight: 500,
          }}
        >
          {type || 'Standard'}
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
      title: 'Join Date',
      dataIndex: 'joinDate',
      key: 'joinDate',
      render: (date: string) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString();
      },
    },
    {
      title: 'Status',
      dataIndex: 'isDeleted',
      key: 'isDeleted',
      render: (isDeleted: boolean) => (
        <span
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            background: isDeleted
              ? mode === 'dark'
                ? 'rgba(239,68,68,0.2)'
                : 'rgba(239,68,68,0.1)'
              : mode === 'dark'
                ? 'rgba(34,197,94,0.2)'
                : 'rgba(34,197,94,0.1)',
            color: isDeleted ? '#ef4444' : '#22c55e',
            fontSize: '12px',
            fontWeight: 500,
          }}
        >
          {isDeleted ? 'Inactive' : 'Active'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Member) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleUpdate(record)}
            style={{ color: mode === 'dark' ? '#e5e7eb' : '#111827' }}
          />
          <Popconfirm
            title="Are you sure you want to delete this member?"
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
        <Typography.Text>Loading members...</Typography.Text>
      </div>
    );
  }

  if (error) {
    return <Alert description="Error loading members" type="error" showIcon />;
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
              Member Management
            </Title>
            <Typography.Text style={{ color: mode === 'dark' ? '#9ca3af' : '#6b7280', fontSize: 14 }}>
              Manage organization members and their subscriptions
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
              onClick={handleAddMember}
              style={{
                borderRadius: 8,
                height: 40,
              }}
            >
              Add Member
            </Button>
          </Space>
        </Flex>

        <Table
          columns={columns}
          dataSource={members}
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
        title={editingMember ? 'Edit Member' : 'Create Member'}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={600}
        destroyOnHidden={true}
      >
        <UniForm
          onSubmit={handleFormSubmit}
          defaultValues={
            editingMember
              ? {
                  name: editingMember.name,
                  email: editingMember.email,
                  contactNo: editingMember.contactNo || '',
                  address: editingMember.address || '',
                  membershipType: editingMember.membershipType || 'standard',
                }
              : {
                  name: '',
                  email: '',
                  contactNo: '',
                  address: '',
                  membershipType: 'standard',
                }
          }
        >
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
            <Col span={12}>
              <UniInput type="text" name="address" label="Address" />
            </Col>
            <Col span={24}>
              <UniInput type="text" name="membershipType" label="Membership Type" />
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
                {editingMember ? 'Update' : 'Create'}
              </Button>
            </Space>
          </div>
        </UniForm>
      </Modal>
    </div>
  );
};

export default Member;
