import { BellOutlined, CheckCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { Badge, Button, Dropdown, List, message, Spin, Typography } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useDeleteNotificationMutation,
  useGetUserNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from '../../redux/features/notification/notification.api';
import { useThemeMode } from '../../theme/ThemeProvider';

const { Text } = Typography;

type NotificationItem = {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
};

const NotificationBell = () => {
  const { mode } = useThemeMode();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  
  const { data: notificationsData, isLoading } = useGetUserNotificationsQuery(
    { limit: '10' },
    { pollingInterval: 30000 },
  );
  
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const notifications = (notificationsData?.data || []) as NotificationItem[];
  const unreadCount = notificationsData?.meta?.unreadCount || 0;

  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.read) {
      await markAsRead(item._id);
    }
    if (item.actionUrl) {
      navigate(item.actionUrl);
      setOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead(undefined).unwrap();
      message.success('All notifications marked as read');
    } catch {
      message.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteNotification(id).unwrap();
      message.success('Notification removed');
    } catch {
      message.error('Failed to delete notification');
    }
  };

  const isDark = mode === 'dark';

  const notificationList = (
    <div
      style={{
        width: 350,
        backgroundColor: isDark ? '#020617' : '#ffffff',
        boxShadow: isDark
          ? '0 24px 80px rgba(15,23,42,0.9)'
          : '0 16px 40px rgba(15,23,42,0.18)',
        borderRadius: 16,
        border: isDark ? '1px solid rgba(148,163,184,0.35)' : '1px solid #e5e7eb',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          borderBottom: isDark
            ? '1px solid rgba(148,163,184,0.24)'
            : '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text strong style={{ color: isDark ? '#e5e7eb' : '#111827' }}>
          Notifications
        </Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={handleMarkAllRead} icon={<CheckCircleOutlined />}>
            Mark all read
          </Button>
        )}
      </div>
      
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {isLoading ? (
          <div style={{ padding: 20, textAlign: 'center' }}><Spin /></div>
        ) : notifications.length === 0 ? (
          <div
            style={{
              padding: 20,
              textAlign: 'center',
              color: isDark ? '#9ca3af' : '#6b7280',
            }}
          >
            No notifications
          </div>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={(item: NotificationItem) => (
              <List.Item
                className="notification-item"
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  backgroundColor: item.read
                    ? 'transparent'
                    : isDark
                    ? 'rgba(37,99,235,0.12)'
                    : '#eff6ff',
                  transition: 'background-color 0.3s',
                  borderBottom: isDark
                    ? '1px solid rgba(30,64,175,0.35)'
                    : '1px solid #e5e7eb',
                }}
                onClick={() => handleNotificationClick(item)}
                actions={[
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<DeleteOutlined />} 
                    onClick={(e) => handleDelete(e, item._id)} 
                  />
                ]}
              >
                <List.Item.Meta
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text strong={!item.read}>{item.title}</Text>
                    </div>
                  }
                  description={
                    <div>
                        <div style={{ fontSize: 13, marginBottom: 4 }}>{item.message}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                                {new Date(item.createdAt).toLocaleTimeString()}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                                {new Date(item.createdAt).toLocaleDateString()}
                            </Text>
                        </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );

  return (
    <Dropdown 
        popupRender={() => notificationList} 
        trigger={['click']}
        open={open}
        onOpenChange={setOpen}
        placement="bottomRight"
    >
      <Badge count={unreadCount} overflowCount={99}>
        <Button shape="circle" icon={<BellOutlined />} />
      </Badge>
    </Dropdown>
  );
};

export default NotificationBell;
