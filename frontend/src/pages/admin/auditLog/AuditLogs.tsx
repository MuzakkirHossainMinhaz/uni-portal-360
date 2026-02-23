import { Table, Tag, Input, Select, DatePicker, Space } from 'antd';
import { useState } from 'react';
import { useGetAuditLogsQuery } from '../../../redux/features/admin/auditLog/auditLog.api';
import moment from 'moment';
import { TAuditLog } from '../../../types/auditLog.type';

const { RangePicker } = DatePicker;

type AuditLogQueryParams = {
  page: number;
  limit: number;
  action?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
};

const AuditLogs = () => {
  const [params, setParams] = useState<AuditLogQueryParams>({ page: 1, limit: 10 });
  const { data: auditLogs, isFetching } = useGetAuditLogsQuery({
    page: params.page.toString(),
    limit: params.limit.toString(),
    ...(params.action ? { action: params.action } : {}),
    ...(params.severity ? { severity: params.severity } : {}),
    ...(params.startDate ? { startDate: params.startDate } : {}),
    ...(params.endDate ? { endDate: params.endDate } : {}),
  });

  const columns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => moment(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'User',
      dataIndex: 'userId',
      key: 'userId',
      render: (user: TAuditLog['userId']) =>
        typeof user === 'object' && user && 'email' in user ? user.email : 'Unknown',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: 'Entity Type',
      dataIndex: 'entityType',
      key: 'entityType',
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => {
        let color = 'blue';
        if (severity === 'MEDIUM') color = 'orange';
        if (severity === 'HIGH') color = 'red';
        if (severity === 'CRITICAL') color = 'magenta';
        return <Tag color={color}>{severity}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'SUCCESS' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
    {
        title: 'IP Address',
        dataIndex: 'ipAddress',
        key: 'ipAddress',
    }
  ];

  const handleTableChange = (pagination: { current?: number; pageSize?: number }) => {
    setParams({
      ...params,
      page: pagination.current ?? 1,
      limit: pagination.pageSize ?? params.limit,
    });
  };

  const handleFilterChange = (key: keyof AuditLogQueryParams, value: string | undefined) => {
    setParams({
      ...params,
      page: 1,
      [key]: value,
    });
  };

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Audit Logs</h1>
      
      <Space style={{ marginBottom: 20, flexWrap: 'wrap' }}>
        <Input 
            placeholder="Search by Action" 
            onChange={(e) => handleFilterChange('action', e.target.value)} 
            style={{ width: 200 }}
        />
        <Select
            placeholder="Severity"
            allowClear
            style={{ width: 120 }}
            onChange={(value) => handleFilterChange('severity', value)}
            options={[
                { value: 'LOW', label: 'Low' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'HIGH', label: 'High' },
                { value: 'CRITICAL', label: 'Critical' },
            ]}
        />
        <RangePicker 
            onChange={(dates, dateStrings) => {
                if (dates) {
                    setParams({
                        ...params,
                        startDate: dateStrings[0],
                        endDate: dateStrings[1],
                        page: 1
                    });
                } else {
                    const newParams = { ...params };
                    delete newParams.startDate;
                    delete newParams.endDate;
                    setParams(newParams);
                }
            }}
        />
      </Space>

      <Table
        loading={isFetching}
        columns={columns}
        dataSource={auditLogs?.data}
        rowKey="_id"
        pagination={{
          current: params.page,
          pageSize: params.limit,
          total: auditLogs?.meta?.total,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}
        expandable={{
            expandedRowRender: (record) => (
                <div style={{ margin: 0 }}>
                    <p><strong>User Agent:</strong> {record.userAgent}</p>
                    <p><strong>Entity ID:</strong> {record.entityId}</p>
                    {record.oldValues && Object.keys(record.oldValues).length > 0 && (
                        <div>
                            <strong>Old Values:</strong>
                            <pre>{JSON.stringify(record.oldValues, null, 2)}</pre>
                        </div>
                    )}
                    {record.newValues && Object.keys(record.newValues).length > 0 && (
                        <div>
                            <strong>New Values:</strong>
                            <pre>{JSON.stringify(record.newValues, null, 2)}</pre>
                        </div>
                    )}
                </div>
            ),
        }}
      />
    </div>
  );
};

export default AuditLogs;
