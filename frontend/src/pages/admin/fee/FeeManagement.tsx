import { Button, DatePicker, Form, Input, InputNumber, Modal, Select, Table, Tag, message, Row, Col } from 'antd';
import { useState } from 'react';
import { useCreateFeeMutation, useGetAllFeesQuery } from '../../../redux/features/fee/fee.api';
import moment from 'moment';
import PHForm from '../../../components/form/PHForm';
import PHInput from '../../../components/form/PHInput';
import PHSelect from '../../../components/form/PHSelect';
import { useGetAllStudentsQuery } from '../../../redux/features/admin/userManagement.api';
import { useGetAllSemestersQuery } from '../../../redux/features/admin/academicManagement.api';
import PHDatePicker from '../../../components/form/PHDatePicker';

const FeeManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: fees, isFetching } = useGetAllFeesQuery(undefined);
  const [createFee] = useCreateFeeMutation();

  const columns = [
    {
      title: 'Student ID',
      dataIndex: ['student', 'id'],
      key: 'studentId',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === 'PAID') color = 'green';
        if (status === 'PENDING') color = 'gold';
        if (status === 'OVERDUE') color = 'red';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => moment(date).format('YYYY-MM-DD'),
    },
  ];

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1>Fee Management</h1>
        <Button type="primary" onClick={showModal}>Generate Fee</Button>
      </div>
      
      <Table
        loading={isFetching}
        columns={columns}
        dataSource={fees?.data}
        rowKey="_id"
      />

      <CreateFeeModal open={isModalOpen} onCancel={handleCancel} />
    </div>
  );
};

const CreateFeeModal = ({ open, onCancel }: { open: boolean; onCancel: () => void }) => {
    const [createFee] = useCreateFeeMutation();
    const { data: students } = useGetAllStudentsQuery(undefined);
    const { data: semesters } = useGetAllSemestersQuery(undefined);

    const studentOptions = students?.data?.map((item: any) => ({
        value: item._id,
        label: `${item.name.firstName} ${item.name.lastName} (${item.id})`
    }));

    const semesterOptions = semesters?.data?.map((item: any) => ({
        value: item._id,
        label: `${item.name} ${item.year}`
    }));

    const feeTypeOptions = [
        { value: 'TUITION', label: 'Tuition' },
        { value: 'LIBRARY', label: 'Library' },
        { value: 'EXAM', label: 'Exam' },
        { value: 'HOSTEL', label: 'Hostel' },
        { value: 'MISC', label: 'Miscellaneous' },
    ];

    const onSubmit = async (data: any) => {
        const toastId = message.loading('Generating fee...');
        try {
            const feeData = {
                student: data.student,
                academicSemester: data.academicSemester,
                type: data.type,
                amount: Number(data.amount),
                dueDate: moment(new Date(data.dueDate)).format('YYYY-MM-DD'),
                description: data.description,
                status: 'PENDING'
            };

            await createFee(feeData).unwrap();
            message.success('Fee generated successfully');
            onCancel();
        } catch (error) {
            message.error('Failed to generate fee');
        } finally {
            message.destroy(toastId);
        }
    };

    return (
        <Modal title="Generate Fee" open={open} onCancel={onCancel} footer={null}>
            <PHForm onSubmit={onSubmit}>
                <Row gutter={16}>
                    <Col span={24}>
                        <PHSelect name="student" label="Student" options={studentOptions} />
                    </Col>
                    <Col span={24}>
                        <PHSelect name="academicSemester" label="Semester" options={semesterOptions} />
                    </Col>
                    <Col span={12}>
                        <PHSelect name="type" label="Fee Type" options={feeTypeOptions} />
                    </Col>
                    <Col span={12}>
                        <PHInput type="number" name="amount" label="Amount" />
                    </Col>
                    <Col span={12}>
                        <PHDatePicker name="dueDate" label="Due Date" />
                    </Col>
                    <Col span={24}>
                        <PHInput type="text" name="description" label="Description" />
                    </Col>
                </Row>
                <div style={{ display: 'flex', justifyContent: 'end' }}>
                    <Button htmlType="submit" type="primary">Generate</Button>
                </div>
            </PHForm>
        </Modal>
    );
};

export default FeeManagement;
