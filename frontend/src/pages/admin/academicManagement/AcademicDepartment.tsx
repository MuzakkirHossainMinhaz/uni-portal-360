import { BuildOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, message, Modal, Popconfirm, Row, Space, Table, Typography } from 'antd';
import { useState } from 'react';
import { useThemeMode } from '../../../theme/ThemeProvider';

const { Title } = Typography;

interface AcademicDepartment {
  _id: string;
  name: string;
  code: string;
  hod: string;
  description: string;
  facultyCount: number;
  status: 'active' | 'inactive';
  establishedYear: string;
}

const AcademicDepartment = () => {
  const { mode } = useThemeMode();
  const [departments, setDepartments] = useState<AcademicDepartment[]>([
    {
      _id: '1',
      name: 'Computer Science & Engineering',
      code: 'CSE',
      hod: 'Dr. John Smith',
      description:
        'Department of Computer Science and Engineering offers programs in software development, AI, and system design.',
      facultyCount: 45,
      status: 'active',
      establishedYear: '2010',
    },
    {
      _id: '2',
      name: 'Mathematics',
      code: 'MATH',
      hod: 'Dr. Sarah Johnson',
      description: 'Mathematics department focuses on pure and applied mathematics with research in various fields.',
      facultyCount: 32,
      status: 'active',
      establishedYear: '2005',
    },
    {
      _id: '3',
      name: 'Physics',
      code: 'PHY',
      hod: 'Dr. Michael Brown',
      description: 'Physics department covers theoretical and experimental physics with modern laboratories.',
      facultyCount: 28,
      status: 'inactive',
      establishedYear: '2012',
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<AcademicDepartment | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    hod: '',
    description: '',
    facultyCount: 0,
    status: 'active' as 'active' | 'inactive',
    establishedYear: '',
  });

  const showModal = (department?: AcademicDepartment) => {
    if (department) {
      setEditingDepartment(department);
      setFormData({
        name: department.name,
        code: department.code,
        hod: department.hod,
        description: department.description,
        facultyCount: department.facultyCount,
        status: department.status,
        establishedYear: department.establishedYear,
      });
    } else {
      setEditingDepartment(null);
      setFormData({
        name: '',
        code: '',
        hod: '',
        description: '',
        facultyCount: 0,
        status: 'active',
        establishedYear: '',
      });
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    if (editingDepartment) {
      // Update logic
      setDepartments(
        departments.map((d) => (d._id === editingDepartment._id ? { ...formData, _id: editingDepartment._id } : d)),
      );
      message.success('Department updated successfully');
    } else {
      // Create logic
      const newDepartment: AcademicDepartment = {
        _id: Date.now().toString(),
        ...formData,
      };
      setDepartments([...departments, newDepartment]);
      message.success('Department created successfully');
    }
    setIsModalVisible(false);
    setEditingDepartment(null);
  };

  const handleDelete = (id: string) => {
    setDepartments(departments.filter((d) => d._id !== id));
    message.success('Department deleted successfully');
  };

  const columns = [
    {
      title: 'Department Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Space>
          <BuildOutlined style={{ color: '#0f6ad8', marginRight: 8 }} />
          <span style={{ color: mode === 'dark' ? '#e5e7eb' : '#111827' }}>{name}</span>
        </Space>
      ),
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'HOD',
      dataIndex: 'hod',
      key: 'hod',
    },
    {
      title: 'Faculty Count',
      dataIndex: 'facultyCount',
      key: 'facultyCount',
      render: (count: number) => (
        <span
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            background: mode === 'dark' ? 'rgba(15,23,42,0.2)' : 'rgba(0,0,0,0.04)',
            color: mode === 'dark' ? '#e5e7eb' : '#111827',
            fontSize: '12px',
            fontWeight: 500,
          }}
        >
          {count} Faculty
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            background:
              status === 'active'
                ? mode === 'dark'
                  ? 'rgba(34,197,94,0.2)'
                  : 'rgba(34,197,94,0.1)'
                : mode === 'dark'
                  ? 'rgba(239,68,68,0.2)'
                  : 'rgba(239,68,68,0.1)',
            color: status === 'active' ? '#22c55e' : '#ef4444',
            fontSize: '12px',
            fontWeight: 500,
          }}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
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
            onClick={() => showModal(record)}
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

  return (
    <div>
      <Card
        style={{
          background: mode === 'dark' ? 'rgba(15,23,42,0.96)' : 'rgba(255,255,255,0.98)',
          borderRadius: 16,
          border: mode === 'dark' ? '1px solid rgba(148,163,184,0.2)' : '1px solid rgba(226,232,240,0.6)',
          boxShadow: mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, color: mode === 'dark' ? '#e5e7eb' : '#111827' }}>
            Department Management
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
            style={{
              background: 'linear-gradient(135deg, #0f6ad8 0%, #0ea5e9 100%)',
              border: 'none',
              borderRadius: 8,
              height: 40,
            }}
          >
            Add Department
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={departments}
          rowKey="_id"
          style={{
            background: mode === 'dark' ? 'rgba(30,41,59,0.8)' : 'rgba(248,250,252,0.8)',
            borderRadius: 12,
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      <Modal
        title={editingDepartment ? 'Edit Department' : 'Create Department'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText={editingDepartment ? 'Update' : 'Create'}
        cancelText="Cancel"
        style={{
          background: mode === 'dark' ? '#0f172a' : '#ffffff',
        }}
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Row gutter={16}>
            <Col span={12}>
              <label style={{ color: mode === 'dark' ? '#e5e7eb' : '#111827', marginBottom: 8 }}>Department Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: mode === 'dark' ? '1px solid rgba(148,163,184,0.2)' : '1px solid rgba(226,232,240,0.6)',
                  background: mode === 'dark' ? 'rgba(30,41,59,0.8)' : 'rgba(248,250,252,0.8)',
                  color: mode === 'dark' ? '#e5e7eb' : '#111827',
                }}
              />
            </Col>
            <Col span={12}>
              <label style={{ color: mode === 'dark' ? '#e5e7eb' : '#111827', marginBottom: 8 }}>Department Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: mode === 'dark' ? '1px solid rgba(148,163,184,0.2)' : '1px solid rgba(226,232,240,0.6)',
                  background: mode === 'dark' ? 'rgba(30,41,59,0.8)' : 'rgba(248,250,252,0.8)',
                  color: mode === 'dark' ? '#e5e7eb' : '#111827',
                }}
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <label style={{ color: mode === 'dark' ? '#e5e7eb' : '#111827', marginBottom: 8 }}>
                Head of Department
              </label>
              <input
                type="text"
                value={formData.hod}
                onChange={(e) => setFormData({ ...formData, hod: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: mode === 'dark' ? '1px solid rgba(148,163,184,0.2)' : '1px solid rgba(226,232,240,0.6)',
                  background: mode === 'dark' ? 'rgba(30,41,59,0.8)' : 'rgba(248,250,252,0.8)',
                  color: mode === 'dark' ? '#e5e7eb' : '#111827',
                }}
              />
            </Col>
            <Col span={12}>
              <label style={{ color: mode === 'dark' ? '#e5e7eb' : '#111827', marginBottom: 8 }}>
                Established Year
              </label>
              <input
                type="text"
                value={formData.establishedYear}
                onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: mode === 'dark' ? '1px solid rgba(148,163,184,0.2)' : '1px solid rgba(226,232,240,0.6)',
                  background: mode === 'dark' ? 'rgba(30,41,59,0.8)' : 'rgba(248,250,252,0.8)',
                  color: mode === 'dark' ? '#e5e7eb' : '#111827',
                }}
              />
            </Col>
          </Row>
          <div>
            <label style={{ color: mode === 'dark' ? '#e5e7eb' : '#111827', marginBottom: 8 }}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: mode === 'dark' ? '1px solid rgba(148,163,184,0.2)' : '1px solid rgba(226,232,240,0.6)',
                background: mode === 'dark' ? 'rgba(30,41,59,0.8)' : 'rgba(248,250,252,0.8)',
                color: mode === 'dark' ? '#e5e7eb' : '#111827',
                resize: 'vertical',
              }}
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default AcademicDepartment;
