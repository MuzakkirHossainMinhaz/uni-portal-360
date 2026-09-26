import { Alert, Button, Card, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router-dom';
import {
  RoleGuide,
  useGetRoleGuideQuery
} from '../../../redux/features/admin/userDirectory.api';

const { Title, Paragraph, Text } = Typography;

const AccountsAndRoles = () => {
  const roles = useGetRoleGuideQuery(undefined, { refetchOnMountOrArgChange: true });

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
      render: (count: number, item) => count + item.deletedAccounts,
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
        description="This guide includes all account roles, including Super Admin accounts without an Admin profile. Profile actions remain in the management pages. Viewing a role here does not enable it or grant access."
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
          Role totals include deleted accounts. Unknown stored roles are marked unsupported.
        </Paragraph>
      </Card>

    </Space>
  );
};

export default AccountsAndRoles;
