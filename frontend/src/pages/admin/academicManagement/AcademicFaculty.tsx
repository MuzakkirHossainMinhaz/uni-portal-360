import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Col, message, Modal, Popconfirm, Row, Space, Table, Typography } from 'antd';
import { useState } from 'react';
import { useThemeMode } from '../../../theme/ThemeProvider';

const { Title } = Typography;

interface AcademicFaculty {
  _id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  phone: string;
  status: 'active' | 'inactive';
  joinDate: string;
}

const AcademicFaculty = () => {
  const { mode } = useThemeMode();
  const [faculty, setFaculty] = useState<AcademicFaculty[]>([
    {
      _id: '1',
      name: 'Dr. John Smith',
      email: 'john.smith@university.edu',
      department: 'Computer Science',
      designation: 'Professor',
      phone: '+1 234-567-8900',
      status: 'active',
      joinDate: '2020-08-15',
    },
    {
      _id: '2',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@university.edu',
      department: 'Mathematics',
      designation: 'Associate Professor',
      phone: '+1 234-567-8901',
      status: 'active',
      joinDate: '2019-03-20',
    },
    {
      _id: '3',
      name: 'Dr. Michael Brown',
      email: 'michael.brown@university.edu',
      department: 'Physics',
      designation: 'Assistant Professor',
      phone: '+1 234-567-8902',
      status: 'inactive',
      joinDate: '2021-01-10',
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<AcademicFaculty | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    designation: '',
    phone: '',
    status: 'active' as 'active' | 'inactive',
  });

  const showModal = (facultyMember?: AcademicFaculty) => {
    if (facultyMember) {
      setEditingFaculty(facultyMember);
      setFormData({
        name: facultyMember.name,
        email: facultyMember.email,
        department: facultyMember.department,
        designation: facultyMember.designation,
        phone: facultyMember.phone,
        status: facultyMember.status,
      });
    } else {
      setEditingFaculty(null);
      setFormData({
        name: '',
        email: '',
        department: '',
        designation: '',
        phone: '',
        status: 'active',
      });
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    if (editingFaculty) {
      // Update logic
      setFaculty(
        faculty.map((f) =>
          f._id === editingFaculty._id ? { ...formData, _id: editingFaculty._id, joinDate: f.joinDate } : f,
        ),
      );
      message.success('Faculty updated successfully');
    } else {
      // Create logic
      const newFaculty: AcademicFaculty = {
        _id: Date.now().toString(),
        ...formData,
        joinDate: new Date().toISOString().split('T')[0],
      };
      setFaculty([...faculty, newFaculty]);
      message.success('Faculty created successfully');
    }
    setIsModalVisible(false);
    setEditingFaculty(null);
  };

  const handleDelete = (id: string) => {
    setFaculty(faculty.filter((f) => f._id !== id));
    message.success('Faculty deleted successfully');
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Space>
          <Avatar size="small" style={{ backgroundColor: '#0f6ad8', marginRight: 8 }}>
            {name.charAt(0)}
          </Avatar>
          <span style={{ color: mode === 'dark' ? '#e5e7eb' : '#111827' }}>{name}</span>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
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
      render: (_: any, record: AcademicFaculty) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            style={{ color: mode === 'dark' ? '#e5e7eb' : '#111827' }}
          />
          <Popconfirm
            title="Are you sure you want to delete this faculty member?"
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
            Faculty Management
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
            Add Faculty
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={faculty}
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
        title={editingFaculty ? 'Edit Faculty' : 'Create Faculty'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText={editingFaculty ? 'Update' : 'Create'}
        cancelText="Cancel"
        style={{
          background: mode === 'dark' ? '#0f172a' : '#ffffff',
        }}
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <div>
            <label style={{ color: mode === 'dark' ? '#e5e7eb' : '#111827', marginBottom: 8 }}>Full Name</label>
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
          </div>
          <Row gutter={16}>
            <Col span={12}>
              <label style={{ color: mode === 'dark' ? '#e5e7eb' : '#111827', marginBottom: 8 }}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              <label style={{ color: mode === 'dark' ? '#e5e7eb' : '#111827', marginBottom: 8 }}>Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
              <label style={{ color: mode === 'dark' ? '#e5e7eb' : '#111827', marginBottom: 8 }}>Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
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
              <label style={{ color: mode === 'dark' ? '#e5e7eb' : '#111827', marginBottom: 8 }}>Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
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
        </Space>
      </Modal>
    </div>
  );
};

export default AcademicFaculty;
