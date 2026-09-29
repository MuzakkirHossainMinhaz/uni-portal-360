import { Alert, Button, Card, List, Pagination, Space, Typography } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useDeleteNotificationMutation,
  useGetUserNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from '../redux/features/notification/notification.api';

const Notifications = () => {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { data, isFetching, isError, refetch } = useGetUserNotificationsQuery({ page: String(page), limit: '20' });
  const [markRead] = useMarkAsReadMutation();
  const [markAll] = useMarkAllAsReadMutation();
  const [remove] = useDeleteNotificationMutation();
  return (
    <Card title="Notifications" extra={<Button onClick={() => markAll()}>Mark all read</Button>}>
      {isError && (
        <Alert type="error" message="Could not load notifications" action={<Button onClick={refetch}>Retry</Button>} />
      )}
      <List
        loading={isFetching}
        dataSource={data?.data ?? []}
        locale={{ emptyText: 'No notifications' }}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button key="remove" onClick={() => remove(item._id)}>
                Delete
              </Button>,
            ]}
          >
            <Space direction="vertical" size={2}>
              <Typography.Text strong={!item.read}>{item.title}</Typography.Text>
              <Typography.Text>{item.message}</Typography.Text>
              <Typography.Text type="secondary">{new Date(item.createdAt).toLocaleString()}</Typography.Text>
              {item.actionUrl && (
                <Button
                  type="link"
                  style={{ padding: 0 }}
                  onClick={async () => {
                    if (!item.read) await markRead(item._id);
                    navigate(item.actionUrl!);
                  }}
                >
                  Open related page
                </Button>
              )}
            </Space>
          </List.Item>
        )}
      />
      <Pagination
        current={page}
        pageSize={20}
        total={data?.meta?.total ?? 0}
        onChange={setPage}
        showSizeChanger={false}
      />
    </Card>
  );
};

export default Notifications;
