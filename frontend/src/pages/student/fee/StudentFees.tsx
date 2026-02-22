import { Button, Card, Col, Modal, Row, Statistic, Table, Tag, message } from 'antd';
import { useState } from 'react';
import { useGetMyFeesQuery, usePayFeeMutation } from '../../../redux/features/fee/fee.api';
import moment from 'moment';
import { DownloadReceipt } from '../../../components/fee/FeeReceipt';

const StudentFees = () => {
  const { data: fees, isFetching } = useGetMyFeesQuery(undefined);
  const [payFee, { isLoading: isPaying }] = usePayFeeMutation();

  const handlePay = async (id: string) => {
    try {
        // Simulate payment gateway
        const transactionId = `TXN-${Math.floor(Math.random() * 1000000)}`;
        await payFee({ id, transactionId: transactionId }).unwrap();
        message.success('Fee paid successfully');
    } catch (error) {
        message.error('Payment failed');
    }
  };

  const columns = [
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
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => moment(date).format('YYYY-MM-DD'),
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
      title: 'Action',
      key: 'action',
      render: (item: any) => (
        item.status === 'PAID' ? (
            <DownloadReceipt fee={item} />
        ) : (
            <Button 
                type="primary" 
                size="small" 
                onClick={() => handlePay(item._id)}
                loading={isPaying}
            >
                Pay Now
            </Button>
        )
      ),
    },
  ];

  const pendingAmount = fees?.data?.filter((f: any) => f.status === 'PENDING' || f.status === 'OVERDUE')
    .reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0;

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>My Fees</h1>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic title="Pending Dues" value={pendingAmount} precision={2} prefix="$" valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
      </Row>

      <Table
        loading={isFetching}
        columns={columns}
        dataSource={fees?.data}
        rowKey="_id"
      />
    </div>
  );
};

export default StudentFees;
