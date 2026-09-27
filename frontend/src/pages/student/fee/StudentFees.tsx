import { Alert, App, Button, Card, Col, Row, Select, Statistic, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useState } from 'react';
import { DownloadReceipt } from '../../../components/fee/DownloadReceipt';
import {
  type FeeItem,
  useGetMyFeesQuery,
  useGetMyFeeSummaryQuery,
  usePayFeeMutation,
} from '../../../redux/features/fee/fee.api';

const StudentFees = () => {
  const { message, modal } = App.useApp();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [status, setStatus] = useState<string>();
  const { data, isFetching, error, refetch } = useGetMyFeesQuery({
    page: String(page),
    limit: String(size),
    status: status ?? '',
  });
  const { data: summary } = useGetMyFeeSummaryQuery();
  const [payFee, { isLoading: isPaying }] = usePayFeeMutation();

  const pay = async (id: string) => {
    try {
      await payFee(id).unwrap();
      message.success('Simulated payment recorded');
    } catch (cause) {
      message.error((cause as { data?: { message?: string } })?.data?.message ?? 'Could not record payment');
    }
  };

  const columns: ColumnsType<FeeItem> = [
    {
      title: 'Semester',
      render: (_, item) =>
        item.academicSemester ? `${item.academicSemester.name} ${item.academicSemester.year}` : '—',
    },
    { title: 'Type', dataIndex: 'type' },
    { title: 'Amount', dataIndex: 'amount', render: (amount: number) => `$${amount.toFixed(2)}` },
    { title: 'Due date', dataIndex: 'dueDate', render: (date: string) => dayjs(date).format('DD MMM YYYY') },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (value: FeeItem['status']) => (
        <Tag color={value === 'PAID' ? 'green' : value === 'OVERDUE' ? 'red' : 'gold'}>{value}</Tag>
      ),
    },
    {
      title: 'Action',
      render: (_, item) =>
        item.status === 'PAID' ? (
          <DownloadReceipt fee={item} />
        ) : item.status === 'PENDING' || item.status === 'OVERDUE' ? (
          <Button
            type="primary"
            size="small"
            loading={isPaying}
            onClick={() =>
              modal.confirm({
                title: 'Record a simulated payment?',
                content: 'This records a demo transaction. No money is transferred.',
                onOk: () => pay(item._id),
              })
            }
          >
            Simulate payment
          </Button>
        ) : (
          '—'
        ),
    },
  ];

  return (
    <div>
      <h1>My Fees</h1>
      <Alert
        type="info"
        showIcon
        message="Payments on this portal are simulated. No money is transferred."
        style={{ marginBottom: 20 }}
      />
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic title="Unpaid dues" value={summary?.unpaidAmount ?? 0} precision={2} prefix="$" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic title="Unpaid items" value={summary?.unpaidCount ?? 0} />
          </Card>
        </Col>
      </Row>
      <Select
        aria-label="Filter fees by status"
        placeholder="Filter status"
        allowClear
        value={status}
        onChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        options={['PENDING', 'OVERDUE', 'PARTIAL', 'PAID'].map((value) => ({ value, label: value }))}
        style={{ width: 180, marginBottom: 16 }}
      />
      {error ? (
        <Alert
          type="error"
          showIcon
          message="Could not load fees"
          action={<Button onClick={() => refetch()}>Retry</Button>}
        />
      ) : (
        <Table<FeeItem>
          rowKey="_id"
          columns={columns}
          dataSource={data?.data ?? []}
          loading={isFetching}
          scroll={{ x: 760 }}
          pagination={{
            current: page,
            pageSize: size,
            total: data?.meta?.total ?? 0,
            showSizeChanger: true,
            onChange: (next, nextSize) => {
              setPage(nextSize !== size ? 1 : next);
              setSize(nextSize);
            },
          }}
        />
      )}
    </div>
  );
};

export default StudentFees;
