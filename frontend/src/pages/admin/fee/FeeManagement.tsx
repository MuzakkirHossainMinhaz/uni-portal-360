import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Alert,
  App,
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { type Dayjs } from 'dayjs';
import { useState } from 'react';
import { DownloadReceipt } from '../../../components/fee/DownloadReceipt';
import CourseCard from '../courseManagement/CourseCard';
import { useGetAllAcademicSemestersQuery } from '../../../redux/features/admin/academicManagement.api';
import { useGetAllStudentsQuery } from '../../../redux/features/admin/userManagement.api';
import {
  type CreateFeePayload,
  type FeeItem,
  useCreateFeeMutation,
  useDeleteFeeMutation,
  useGetAllFeesQuery,
  useUpdateFeeMutation,
} from '../../../redux/features/fee/fee.api';

type FeeForm = Omit<CreateFeePayload, 'dueDate'> & { dueDate: Dayjs };
const feeTypes = ['TUITION', 'LIBRARY', 'EXAM', 'HOSTEL', 'MISC'].map((value) => ({ value, label: value }));
const statuses = ['PENDING', 'OVERDUE', 'PARTIAL', 'PAID'].map((value) => ({ value, label: value }));
const errorText = (error: unknown) => (error as { data?: { message?: string } })?.data?.message ?? 'Please try again.';
const editable = (fee: FeeItem) => fee.status === 'PENDING' || fee.status === 'OVERDUE';

const FeeManagement = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm<FeeForm>();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [studentId, setStudentId] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [status, setStatus] = useState<string>();
  const [type, setType] = useState<string>();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FeeItem | null>(null);
  const params = { page: String(page), limit: String(size), studentId, status: status ?? '', type: type ?? '' };
  const { data, isFetching, error, refetch } = useGetAllFeesQuery(params);
  const { data: students, isFetching: loadingStudents } = useGetAllStudentsQuery(
    [
      { name: 'limit', value: 20 },
      { name: 'searchTerm', value: studentSearch },
    ],
    { skip: !open || !!editing },
  );
  const { data: semesters } = useGetAllAcademicSemestersQuery([{ name: 'limit', value: 100 }], {
    skip: !open || !!editing,
  });
  const [create, { isLoading: creating }] = useCreateFeeMutation();
  const [update, { isLoading: updating }] = useUpdateFeeMutation();
  const [remove, { isLoading: removing }] = useDeleteFeeMutation();

  const startCreate = () => {
    setEditing(null);
    form.resetFields();
    setStudentSearch('');
    setOpen(true);
  };
  const startEdit = (fee: FeeItem) => {
    setEditing(fee);
    form.setFieldsValue({
      type: fee.type,
      amount: fee.amount,
      dueDate: dayjs(fee.dueDate),
      description: fee.description,
    });
    setOpen(true);
  };
  const save = async (values: FeeForm) => {
    const payload = {
      type: values.type,
      amount: values.amount,
      dueDate: values.dueDate.format('YYYY-MM-DD'),
      description: values.description,
    };
    try {
      if (editing) {
        await update({ id: editing._id, data: payload }).unwrap();
        message.success('Fee updated');
      } else {
        await create({ ...payload, student: values.student, academicSemester: values.academicSemester }).unwrap();
        setPage(1);
        message.success('Fee generated');
      }
      setOpen(false);
      form.resetFields();
    } catch (cause) {
      message.error(errorText(cause));
    }
  };
  const voidFee = async (id: string) => {
    try {
      await remove(id).unwrap();
      message.success('Fee voided');
    } catch (cause) {
      message.error(errorText(cause));
    }
  };

  const columns: ColumnsType<FeeItem> = [
    {
      title: 'Student',
      render: (_, fee) => (
        <>
          <Typography.Text strong>{fee.student?.id ?? '—'}</Typography.Text>
          <br />
          {fee.student?.fullName ?? '—'}
        </>
      ),
    },
    {
      title: 'Semester',
      render: (_, fee) => (fee.academicSemester ? `${fee.academicSemester.name} ${fee.academicSemester.year}` : '—'),
    },
    { title: 'Type', dataIndex: 'type', render: (value: string) => <Tag color="blue">{value}</Tag> },
    { title: 'Amount', dataIndex: 'amount', render: (value: number) => `$${value.toFixed(2)}` },
    { title: 'Due date', dataIndex: 'dueDate', render: (value: string) => dayjs(value).format('DD MMM YYYY') },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (value: FeeItem['status']) => (
        <Tag color={value === 'PAID' ? 'green' : value === 'OVERDUE' ? 'red' : value === 'PARTIAL' ? 'orange' : 'gold'}>
          {value}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      render: (_, fee) => (
        <Space>
          {fee.status === 'PAID' ? <DownloadReceipt fee={fee} /> : null}
          {editable(fee) ? (
            <>
              <Button
                type="text"
                icon={<EditOutlined />}
                aria-label={`Edit fee for ${fee.student?.id}`}
                onClick={() => startEdit(fee)}
              />
              <Popconfirm
                title="Void this fee?"
                description="The student will no longer see it."
                okText="Void"
                okType="danger"
                onConfirm={() => voidFee(fee._id)}
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  aria-label={`Void fee for ${fee.student?.id}`}
                  disabled={removing}
                />
              </Popconfirm>
            </>
          ) : null}
        </Space>
      ),
    },
  ];

  return (
    <>
      <CourseCard
        title="Fee Management"
        subtitle="Generate fees, track payment status, and issue receipts"
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={startCreate}>
            Generate Fee
          </Button>
        }
      >
        <Space wrap style={{ marginBottom: 16 }}>
          <Input.Search
            aria-label="Search by student ID"
            placeholder="Student ID"
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            onSearch={(value) => {
              setStudentId(value.trim());
              setPage(1);
            }}
            allowClear
            style={{ width: 220 }}
          />
          <Select
            aria-label="Filter by fee status"
            placeholder="Status"
            allowClear
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            options={statuses}
            style={{ width: 140 }}
          />
          <Select
            aria-label="Filter by fee type"
            placeholder="Type"
            allowClear
            value={type}
            onChange={(value) => {
              setType(value);
              setPage(1);
            }}
            options={feeTypes}
            style={{ width: 140 }}
          />
          <Button
            onClick={() => {
              setStudentId('');
              setSearchDraft('');
              setStatus(undefined);
              setType(undefined);
              setPage(1);
            }}
          >
            Clear filters
          </Button>
        </Space>
        {error ? (
          <Alert
            type="error"
            showIcon
            message="Could not load fees"
            description={errorText(error)}
            action={<Button onClick={() => refetch()}>Retry</Button>}
          />
        ) : (
          <Table<FeeItem>
            rowKey="_id"
            columns={columns}
            dataSource={data?.data ?? []}
            loading={isFetching}
            scroll={{ x: 980 }}
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
      </CourseCard>

      <Modal
        title={editing ? 'Edit Fee' : 'Generate Fee'}
        open={open}
        onCancel={() => {
          setOpen(false);
          form.resetFields();
        }}
        footer={null}
        destroyOnHidden
        width={600}
      >
        <Form<FeeForm> form={form} layout="vertical" onFinish={save}>
          {!editing && (
            <>
              <Form.Item name="student" label="Student" rules={[{ required: true, message: 'Select a student' }]}>
                <Select
                  showSearch
                  filterOption={false}
                  onSearch={setStudentSearch}
                  loading={loadingStudents}
                  placeholder="Search by student ID or name"
                  options={
                    students?.data?.map((student) => ({
                      value: student._id,
                      label: `${student.fullName} (${student.id})`,
                    })) ?? []
                  }
                />
              </Form.Item>
              <Form.Item name="academicSemester" label="Academic semester" rules={[{ required: true }]}>
                <Select
                  options={
                    semesters?.data?.map((semester) => ({
                      value: semester._id,
                      label: `${semester.name} ${semester.year}`,
                    })) ?? []
                  }
                />
              </Form.Item>
            </>
          )}
          <Form.Item name="type" label="Fee type" rules={[{ required: true }]}>
            <Select options={feeTypes} />
          </Form.Item>
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <InputNumber min={0.01} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="dueDate" label="Due date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea maxLength={500} rows={3} />
          </Form.Item>
          <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={creating || updating}>
              {editing ? 'Save changes' : 'Generate fee'}
            </Button>
          </Space>
        </Form>
      </Modal>
    </>
  );
};

export default FeeManagement;
