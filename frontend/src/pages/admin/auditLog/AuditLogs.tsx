import { Alert, Button, DatePicker, Input, Select, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useGetAuditLogsQuery } from '../../../redux/features/admin/auditLog/auditLog.api';
import type { TAuditLog } from '../../../types/auditLog.type';
import CourseCard from '../courseManagement/CourseCard';

type Filters = {
  action: string;
  entityType: string;
  severity?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
};
const initialFilters: Filters = { action: '', entityType: '' };
const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((value) => ({ value, label: value }));
const statuses = ['SUCCESS', 'FAILURE'].map((value) => ({ value, label: value }));
const details = (value?: Record<string, unknown>) =>
  value && Object.keys(value).length ? JSON.stringify(value, null, 2) : '—';

const AuditLogs = () => {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [actionDraft, setActionDraft] = useState('');
  const [entityDraft, setEntityDraft] = useState('');
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const params = {
    page: String(page),
    limit: String(size),
    action: filters.action,
    entityType: filters.entityType,
    severity: filters.severity ?? '',
    status: filters.status ?? '',
    startDate: filters.startDate ?? '',
    endDate: filters.endDate ?? '',
  };
  const { data, isFetching, error, refetch } = useGetAuditLogsQuery(params);
  const changeFilter = (change: Partial<Filters>) => {
    setFilters((current) => ({ ...current, ...change }));
    setPage(1);
  };

  const columns: ColumnsType<TAuditLog> = [
    {
      title: 'When',
      dataIndex: 'createdAt',
      render: (value: string) => dayjs(value).format('DD MMM YYYY, HH:mm'),
      width: 175,
    },
    {
      title: 'User',
      dataIndex: 'userId',
      render: (user: TAuditLog['userId']) =>
        typeof user === 'object' && user ? (
          <>
            <Typography.Text strong>{user.id ?? '—'}</Typography.Text>
            <br />
            {user.email}
          </>
        ) : (
          'Unknown'
        ),
    },
    { title: 'Action', dataIndex: 'action', render: (value: string) => <Tag color="blue">{value}</Tag> },
    { title: 'Module', dataIndex: 'entityType' },
    {
      title: 'Severity',
      dataIndex: 'severity',
      render: (value: TAuditLog['severity']) => (
        <Tag
          color={
            value === 'CRITICAL' ? 'magenta' : value === 'HIGH' ? 'red' : value === 'MEDIUM' ? 'orange' : 'default'
          }
        >
          {value}
        </Tag>
      ),
    },
    {
      title: 'Result',
      dataIndex: 'status',
      render: (value: TAuditLog['status']) => <Tag color={value === 'SUCCESS' ? 'green' : 'red'}>{value}</Tag>,
    },
    { title: 'IP address', dataIndex: 'ipAddress', render: (value?: string) => value ?? '—' },
  ];

  return (
    <CourseCard title="Audit Logs" subtitle="Review changes and failed actions across the portal">
      <Space wrap style={{ marginBottom: 16 }}>
        <Input.Search
          aria-label="Search action"
          placeholder="Action"
          value={actionDraft}
          onChange={(event) => setActionDraft(event.target.value)}
          onSearch={(value) => changeFilter({ action: value.trim() })}
          allowClear
          style={{ width: 160 }}
        />
        <Input.Search
          aria-label="Search module"
          placeholder="Module"
          value={entityDraft}
          onChange={(event) => setEntityDraft(event.target.value)}
          onSearch={(value) => changeFilter({ entityType: value.trim() })}
          allowClear
          style={{ width: 160 }}
        />
        <Select
          aria-label="Filter by severity"
          placeholder="Severity"
          allowClear
          value={filters.severity}
          options={severities}
          style={{ width: 135 }}
          onChange={(value) => changeFilter({ severity: value })}
        />
        <Select
          aria-label="Filter by result"
          placeholder="Result"
          allowClear
          value={filters.status}
          options={statuses}
          style={{ width: 130 }}
          onChange={(value) => changeFilter({ status: value })}
        />
        <DatePicker.RangePicker
          aria-label="Filter by date range"
          value={filters.startDate && filters.endDate ? [dayjs(filters.startDate), dayjs(filters.endDate)] : null}
          onChange={(_, dates) => changeFilter({ startDate: dates[0] || undefined, endDate: dates[1] || undefined })}
        />
        <Button
          onClick={() => {
            setActionDraft('');
            setEntityDraft('');
            setFilters(initialFilters);
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
          message="Could not load audit logs"
          action={<Button onClick={() => refetch()}>Retry</Button>}
        />
      ) : (
        <Table<TAuditLog>
          rowKey="_id"
          columns={columns}
          dataSource={data?.data ?? []}
          loading={isFetching}
          scroll={{ x: 1050 }}
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
          expandable={{
            expandedRowRender: (record) => (
              <Space orientation="vertical" style={{ width: '100%' }}>
                <Typography.Text>
                  <strong>Entity ID:</strong> {record.entityId ?? '—'}
                </Typography.Text>
                <Typography.Text>
                  <strong>User agent:</strong> {record.userAgent ?? '—'}
                </Typography.Text>
                <Typography.Text strong>Request details</Typography.Text>
                <pre style={{ maxWidth: '100%', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                  {details(record.metadata)}
                </pre>
                {record.oldValues && (
                  <>
                    <Typography.Text strong>Previous values</Typography.Text>
                    <pre style={{ maxWidth: '100%', overflowX: 'auto' }}>{details(record.oldValues)}</pre>
                  </>
                )}
                {record.newValues && (
                  <>
                    <Typography.Text strong>New values</Typography.Text>
                    <pre style={{ maxWidth: '100%', overflowX: 'auto' }}>{details(record.newValues)}</pre>
                  </>
                )}
              </Space>
            ),
          }}
        />
      )}
    </CourseCard>
  );
};

export default AuditLogs;
