import { Alert, Button, Card, Descriptions } from 'antd';
import { Link } from 'react-router-dom';
import { useGetMyProfileQuery } from '../redux/features/auth/auth.api';

const Profile = () => {
  const { data, isLoading, isError, refetch } = useGetMyProfileQuery();
  const name = data?.name
    ? [data.name.firstName, data.name.middleName, data.name.lastName].filter(Boolean).join(' ')
    : '—';
  return (
    <Card
      title="My profile"
      loading={isLoading}
      extra={
        <Link to="/change-password">
          <Button>Change password</Button>
        </Link>
      }
    >
      {isError ? (
        <Alert type="error" message="Could not load profile" action={<Button onClick={refetch}>Retry</Button>} />
      ) : (
        <Descriptions
          column={1}
          bordered
          items={[
            { key: 'id', label: 'User ID', children: data?.account?.id ?? '—' },
            { key: 'name', label: 'Name', children: name },
            { key: 'email', label: 'Email', children: data?.account?.email ?? '—' },
            { key: 'role', label: 'Role', children: data?.account?.role ?? '—' },
            { key: 'status', label: 'Status', children: data?.account?.status ?? '—' },
          ]}
        />
      )}
    </Card>
  );
};

export default Profile;
