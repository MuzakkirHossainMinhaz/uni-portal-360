import { BellOutlined, CheckCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { Badge, Button, Dropdown, List, MenuProps, message, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useDeleteNotificationMutation,
  useGetUserNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from '../../redux/features/notification/notification.api';

const { Text } = Typography;

const NotificationBell = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  
  // Polling for real-time updates (every 30 seconds)
  const { data: notificationsData, isLoading, refetch } = useGetUserNotificationsQuery(
    { limit: 10 },
    { pollingInterval: 30000 } 
  );
  
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const notifications = notificationsData?.data || [];
  const unreadCount = notificationsData?.meta?.unreadCount || 0;

  const handleNotificationClick = async (item: any) => {
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
    } catch (error) {
      message.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteNotification(id).unwrap();
      message.success('Notification removed');
    } catch (error) {
      message.error('Failed to delete notification');
    }
  };

  const notificationList = (
    <div style={{ width: 350, backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', borderRadius: 4 }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong>Notifications</Text>
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
          <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>No notifications</div>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={(item: any) => (
              <List.Item
                className="notification-item"
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  backgroundColor: item.read ? '#fff' : '#e6f7ff',
                  transition: 'background-color 0.3s',
                  borderBottom: '1px solid #f0f0f0'
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
        dropdownRender={() => notificationList} 
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
