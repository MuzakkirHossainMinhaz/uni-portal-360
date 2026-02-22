import { Button, Modal, Table, Tag, message, Row, Col, Card, Space, Typography, Input } from 'antd';
import { useState } from 'react';
import { useCreateFeeMutation, useGetAllFeesQuery } from '../../../redux/features/fee/fee.api';
import moment from 'moment';
import PHForm from '../../../components/form/PHForm';
import PHInput from '../../../components/form/PHInput';
import PHSelect from '../../../components/form/PHSelect';
import { useGetAllStudentsQuery } from '../../../redux/features/admin/userManagement.api';
import { useGetAllSemestersQuery } from '../../../redux/features/admin/academicManagement.api';
import PHDatePicker from '../../../components/form/PHDatePicker';
import PageHeader from '../../../components/layout/PageHeader';
import { PlusOutlined, FilterOutlined } from '@ant-design/icons';
import { DownloadReceipt } from '../../../components/fee/FeeReceipt';

const FeeManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: fees, isLoading } = useGetAllFeesQuery(undefined);
  const { data: students } = useGetAllStudentsQuery(undefined);
  const { data: semesters } = useGetAllSemestersQuery(undefined);
  const [createFee] = useCreateFeeMutation();

  const studentOptions = students?.data?.map((item: any) => ({
    value: item._id,
    label: `${item.fullName} (${item.id})`,
  }));

  const semesterOptions = semesters?.data?.map((item: any) => ({
    value: item._id,
    label: `${item.name} ${item.year}`,
  }));

  const handleCreateFee = async (data: any) => {
    const hide = message.loading('Creating fee...', 0);
    try {
      await createFee(data).unwrap();
      message.success('Fee created successfully');
      setIsModalOpen(false);
    } catch {
      message.error('Failed to create fee');
    } finally {
      hide();
    }
  };

  const columns = [
    {
      title: 'Student ID',
      dataIndex: 'student',
      key: 'student',
      render: (item: any) => item?.id,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => <Typography.Text strong>${amount}</Typography.Text>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color="blue">{type.toUpperCase()}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === 'Paid') color = 'success';
        if (status === 'Pending') color = 'warning';
        if (status === 'Overdue') color = 'error';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
        title: 'Due Date',
        dataIndex: 'dueDate',
        key: 'dueDate',
        render: (date: string) => moment(date).format('YYYY-MM-DD'),
    },
    {
        title: 'Action',
        key: 'action',
        render: (item: any) => (
             item.status === 'Paid' ? (
                <DownloadReceipt fee={item} />
             ) : (
                 <Button size="small" disabled>Unpaid</Button>
             )
        )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Fee Management"
        subTitle="Track payments, generate invoices, and manage student fees."
        breadcrumbs={[
            { title: 'Dashboard', href: '/admin/dashboard' },
            { title: 'Fee Management' },
        ]}
      />

      <Card bordered={false}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
            <Col>
                 <Space>
                    <Input placeholder="Search by Student ID" style={{ width: 250 }} />
                    <Button icon={<FilterOutlined />}>Filter</Button>
                 </Space>
            </Col>
            <Col>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                    Generate Fee
                </Button>
            </Col>
        </Row>
        
        <Table 
            loading={isLoading}
            dataSource={fees?.data} 
            columns={columns} 
            rowKey="_id"
        />
      </Card>

      <Modal
        title="Generate Fee"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <PHForm onSubmit={handleCreateFee}>
          <PHSelect
            name="student"
            label="Student"
            options={studentOptions}
          />
          <PHSelect
            name="academicSemester"
            label="Semester"
            options={semesterOptions}
          />
          <PHSelect
            name="type"
            label="Fee Type"
            options={[
                { value: 'Tuition', label: 'Tuition' },
                { value: 'Library', label: 'Library' },
                { value: 'Lab', label: 'Lab' },
                { value: 'Exam', label: 'Exam' },
                { value: 'Other', label: 'Other' },
            ]}
          />
          <PHInput type="number" name="amount" label="Amount" />
          <PHDatePicker name="dueDate" label="Due Date" />
          <Button type="primary" htmlType="submit" block style={{ marginTop: 16 }}>
            Create Fee
          </Button>
        </PHForm>
      </Modal>
    </div>
  );
};

export default FeeManagement;
