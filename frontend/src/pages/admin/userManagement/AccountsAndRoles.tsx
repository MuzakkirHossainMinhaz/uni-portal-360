import { Alert, Button, Card, Flex, Input, Select, Space, Switch, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Account,
  RoleGuide,
  useGetAccountDirectoryQuery,
  useGetRoleGuideQuery,
} from '../../../redux/features/admin/userDirectory.api';

const { Title, Paragraph, Text } = Typography;

const AccountsAndRoles = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<string>();
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const accounts = useGetAccountDirectoryQuery(
    { page, limit, search: search || undefined, role, includeDeleted },
    { refetchOnMountOrArgChange: true },
  );
  const roles = useGetRoleGuideQuery(undefined, { refetchOnMountOrArgChange: true });
  const roleDetails = new Map((roles.data ?? []).map((item) => [item.role, item]));

  const roleColumns: ColumnsType<RoleGuide> = [
    { title: 'Role', dataIndex: 'label', width: 150 },
    {
      title: 'Use',
      dataIndex: 'category',
      width: 180,
      render: (category: RoleGuide['category']) => (
        <Tag color={category === 'Core' ? 'blue' : category === 'System owner' ? 'purple' : 'default'}>{category}</Tag>
      ),
    },
    { title: 'Purpose and current support', dataIndex: 'purpose' },
    {
      title: 'Accounts',
      dataIndex: 'accounts',
      width: 110,
      render: (count: number, item) => (
        <Button
          type="link"
          aria-label={`Show ${item.label} accounts`}
          onClick={() => {
            setRole(item.role);
            setSearch('');
            setIncludeDeleted(true);
            setPage(1);
          }}
        >
          {count + item.deletedAccounts}
        </Button>
      ),
    },
    {
      title: 'Profile management',
      key: 'management',
      width: 160,
      render: (_, item) =>
        item.managementPath ? (
          <Link to={item.managementPath}>Manage profiles</Link>
        ) : (
          <Text type="secondary">{item.role === 'superAdmin' ? 'Bootstrap account' : 'Not supported'}</Text>
        ),
    },
  ];

  const accountColumns: ColumnsType<Account> = [
    { title: 'Account ID', dataIndex: 'id' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Role', dataIndex: 'role', render: (value: string) => roleDetails.get(value)?.label ?? value },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (value: string, account) => (
        <Tag color={account.isDeleted || value === 'blocked' ? 'red' : 'green'}>
          {account.isDeleted ? 'Deleted' : value === 'in-progress' ? 'Enabled' : value}
        </Tag>
      ),
    },
    {
      title: 'Password change required',
      dataIndex: 'needsPasswordChange',
      render: (required: boolean) => (required ? 'Yes' : 'No'),
    },
    {
      title: 'Profile management',
      key: 'management',
      render: (_, account) => {
        const path = roleDetails.get(account.role)?.managementPath;
        return path && !account.isDeleted ? (
          <Link to={path}>Manage profiles</Link>
        ) : (
          <Text type="secondary">Read only</Text>
        );
      },
    },
  ];

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={3}>All Accounts &amp; Roles</Title>
        <Paragraph>
          Admin, Faculty and Student cover the main university workflows. Super Admin is the system-owner account within
          administration. These are the four supported account roles.
        </Paragraph>
      </div>
      <Alert
        type="info"
        showIcon
        description="This directory includes all account roles, including Super Admin accounts without an Admin profile. Profile actions remain in the existing management pages. Viewing a role here does not enable it or grant access."
      />
      <Card title="Role guide">
        {roles.isError ? (
          <Alert
            type="error"
            showIcon
            description="Could not load role descriptions."
            action={<Button onClick={() => roles.refetch()}>Retry</Button>}
          />
        ) : (
          <Table<RoleGuide>
            rowKey="role"
            columns={roleColumns}
            dataSource={roles.data ?? []}
            loading={roles.isFetching}
            pagination={false}
            scroll={{ x: 1000 }}
          />
        )}
        <Paragraph type="secondary" style={{ marginTop: 16, marginBottom: 0 }}>
          Role totals include deleted accounts. Click a total to show that role including deleted accounts. Unknown
          stored roles are marked unsupported.
        </Paragraph>
      </Card>
      <Card title="Account directory">
        <Flex gap="middle" wrap align="center" style={{ marginBottom: 16 }}>
          <Input.Search
            key={search}
            aria-label="Search accounts by ID or email"
            placeholder="Search ID or email"
            defaultValue={search}
            allowClear
            style={{ width: 280 }}
            onSearch={(value) => {
              setSearch(value.trim());
              setPage(1);
            }}
          />
          <Select
            aria-label="Filter accounts by role"
            placeholder="All roles"
            allowClear
            value={role}
            style={{ width: 180 }}
            options={(roles.data ?? []).map((item) => ({
              value: item.role,
              label: item.label,
            }))}
            onChange={(value) => {
              setRole(value);
              setPage(1);
            }}
          />
          <Space>
            <Switch
              id="include-deleted"
              checked={includeDeleted}
              onChange={(value) => {
                setIncludeDeleted(value);
                setPage(1);
              }}
            />
            <label htmlFor="include-deleted">Include deleted</label>
          </Space>
          <Button
            onClick={() => {
              accounts.refetch();
              roles.refetch();
            }}
          >
            Refresh
          </Button>
        </Flex>
        {accounts.isError ? (
          <Alert type="error" showIcon description="Could not load accounts. Use Refresh to try again." />
        ) : (
          <Table<Account>
            rowKey="_id"
            columns={accountColumns}
            dataSource={accounts.currentData?.data ?? []}
            loading={accounts.isFetching}
            scroll={{ x: 900 }}
            pagination={{
              current: page,
              pageSize: limit,
              total: accounts.currentData?.meta.total ?? 0,
              showSizeChanger: true,
              pageSizeOptions: [10, 20, 50, 100],
              onChange: (nextPage, nextLimit) => {
                setPage(nextLimit === limit ? nextPage : 1);
                setLimit(nextLimit);
              },
            }}
          />
        )}
      </Card>
    </Space>
  );
};

export default AccountsAndRoles;
