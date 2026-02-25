import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Col, Flex, message, Modal, Popconfirm, Row, Space, Table, Typography } from 'antd';
import { useEffect, useState } from 'react';
import UniForm from '../../../components/form/UniForm';
import UniInput from '../../../components/form/UniInput';
import UniSelect from '../../../components/form/UniSelect';
import UniDatePicker from '../../../components/form/UniDatePicker';
import {
  useGetAllStudentsQuery,
  useAddStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
} from '../../../redux/features/admin/userManagement.api';
import { useGetAllAcademicDepartmentsQuery, useGetAllAcademicSemestersQuery } from '../../../redux/features/admin/academicManagement.api';
import { useThemeMode } from '../../../theme/ThemeProvider';
import { bloodGroupOptions, genderOptions } from '../../../constants/global';
import { TStudent } from '../../../types';

const { Title } = Typography;

const sorter = (a: any, b: any) => {
  const nameA = a.name || '';
  const nameB = b.name || '';
  return nameA.localeCompare(nameB);
};

const Student = () => {
  const { mode } = useThemeMode();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<TStudent | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // API hooks
  const { data: studentsData, isLoading, error } = useGetAllStudentsQuery(undefined);
  const [createStudent] = useAddStudentMutation();
  const [updateStudent] = useUpdateStudentMutation();
  const [deleteStudent] = useDeleteStudentMutation();
  const { data: departmentsData } = useGetAllAcademicDepartmentsQuery({});
  const { data: semestersData } = useGetAllAcademicSemestersQuery({});

  const students = studentsData?.data || [];
  const departments = departmentsData?.data || departmentsData || [];
  const semesters = semestersData?.data || semestersData || [];

  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingStudent(null);
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setIsModalVisible(true);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingStudent) {
        // Update logic
        await updateStudent({
          data,
          id: editingStudent._id,
        }).unwrap();
        message.success('Student updated successfully');
      } else {
        // Create logic
        await createStudent(data).unwrap();
        message.success('Student created successfully');
      }
      setIsModalVisible(false);
      setEditingStudent(null);
    } catch (error) {
      message.error('Operation failed. Please try again.');
    }
  };

  const handleUpdate = (student: any) => {
    setEditingStudent(student);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStudent(id).unwrap();
      message.success('Student deleted successfully');
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
      await Promise.all(selectedRowKeys.map((id) => deleteStudent(id as string).unwrap()));
      setSelectedRowKeys([]);
      message.success(`${selectedRowKeys.length} student(s) deleted successfully`);
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
      setEditingStudent(null);
    }
  }, [isModalVisible]);

  const columns = [
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
      title: 'Department',
      dataIndex: ['academicDepartment', 'name'],
      key: 'academicDepartment',
      render: (deptName: string) => (
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
          {deptName || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Semester',
      dataIndex: ['academicSemester', 'name'],
      key: 'academicSemester',
      render: (semesterName: string, record: any) => (
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
          {semesterName && record.academicSemester ? `${semesterName} ${record.academicSemester.year}` : 'N/A'}
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
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender: string) => (
        <span
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            background: mode === 'dark' ? 'rgba(156,163,175,0.2)' : 'rgba(156,163,175,0.1)',
            color: mode === 'dark' ? '#9ca3af' : '#6b7280',
            fontSize: '12px',
            fontWeight: 500,
          }}
        >
          {gender || 'N/A'}
        </span>
      ),
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
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleUpdate(record)}
            style={{ color: mode === 'dark' ? '#e5e7eb' : '#111827' }}
          />
          <Popconfirm
            title="Are you sure you want to delete this student?"
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
        <Typography.Text>Loading students...</Typography.Text>
      </div>
    );
  }

  if (error) {
    return <Alert description="Error loading students" type="error" showIcon />;
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
              Student Management
            </Title>
            <Typography.Text style={{ color: mode === 'dark' ? '#9ca3af' : '#6b7280', fontSize: 14 }}>
              Manage student enrollment and academic information
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
              onClick={handleAddStudent}
              style={{
                borderRadius: 8,
                height: 40,
              }}
            >
              Add Student
            </Button>
          </Space>
        </Flex>

        <Table
          columns={columns}
          dataSource={students}
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
        title={editingStudent ? 'Edit Student' : 'Create Student'}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
        destroyOnHidden={true}
      >
        <UniForm
          onSubmit={handleFormSubmit}
          defaultValues={
            editingStudent
              ? {
                  name: editingStudent.name,
                  email: editingStudent.email,
                  contactNo: editingStudent.contactNo || '',
                  address: editingStudent?.address || '',
                  academicDepartment: editingStudent.academicDepartment?._id,
                  academicSemester: editingStudent?.academicSemester?._id,
                  gender: editingStudent.gender || '',
                  bloodGroup: editingStudent.bloodGroup || '',
                  dateOfBirth: editingStudent.dateOfBirth || '',
                }
              : {
                  name: '',
                  email: '',
                  contactNo: '',
                  address: '',
                  academicDepartment: '',
                  academicSemester: '',
                  gender: '',
                  bloodGroup: '',
                  dateOfBirth: '',
                }
          }
        >
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <UniInput type="text" name="name" label="Full Name" required />
            </Col>
            <Col span={12}>
              <UniInput type="email" name="email" label="Email Address" required />
            </Col>
            <Col span={12}>
              <UniInput type="text" name="contactNo" label="Contact Number" />
            </Col>
            <Col span={12}>
              <UniInput type="text" name="address" label="Address" />
            </Col>
            <Col span={12}>
              <UniSelect
                name="academicDepartment"
                label="Academic Department"
                required
                options={departments.map((dept: any) => ({
                  value: dept._id,
                  label: dept.name,
                }))}
              />
            </Col>
            <Col span={12}>
              <UniSelect
                name="academicSemester"
                label="Academic Semester"
                required
                options={semesters.map((semester: any) => ({
                  value: semester._id,
                  label: `${semester.name} ${semester.year}`,
                }))}
              />
            </Col>
            <Col span={8}>
              <UniSelect
                name="gender"
                label="Gender"
                options={genderOptions}
              />
            </Col>
            <Col span={8}>
              <UniSelect
                name="bloodGroup"
                label="Blood Group"
                options={bloodGroupOptions}
              />
            </Col>
            <Col span={8}>
              <UniDatePicker
                name="dateOfBirth"
                label="Date of Birth"
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
                {editingStudent ? 'Update' : 'Create'}
              </Button>
            </Space>
          </div>
        </UniForm>
      </Modal>
    </div>
  );
};

export default Student;
