import { DesktopOutlined, LogoutOutlined, MoonOutlined, SunOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Dropdown, Layout, MenuProps, Space } from 'antd';
import { Outlet } from 'react-router-dom';
import { logout, selectCurrentUser } from '../../redux/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { useThemeMode } from '../../theme/ThemeProvider';
import NotificationBell from './NotificationBell';
import Sidebar from './Sidebar';

const { Header, Content } = Layout;

const MainLayout = () => {
  const dispatch = useAppDispatch();
  const { mode, setPreference } = useThemeMode();
  const currentUser = useAppSelector(selectCurrentUser);

  const handleLogout = () => {
    dispatch(logout());
  };

  const themeItems: MenuProps['items'] = [
    {
      key: 'system',
      label: 'System',
      icon: <DesktopOutlined />,
      onClick: () => setPreference('system'),
    },
    {
      key: 'light',
      label: 'Light',
      icon: <SunOutlined />,
      onClick: () => setPreference('light'),
    },
    {
      key: 'dark',
      label: 'Dark',
      icon: <MoonOutlined />,
      onClick: () => setPreference('dark'),
    },
  ];

  const profileItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="app-shell" style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Header
          style={{
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            borderBottom: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(226, 232, 240, 0.8)',
            background: mode === 'dark' ? '#0f172a' : '#ffffff',
            height: 64,
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          <Space size={8}>
            <Dropdown menu={{ items: themeItems }} trigger={['click']} placement="bottomRight">
              <Button
                shape="circle"
                icon={mode === 'dark' ? <MoonOutlined /> : <SunOutlined />}
                style={{
                  color: mode === 'dark' ? '#e5e7eb' : '#111827',
                  borderColor: mode === 'dark' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                }}
              />
            </Dropdown>

            <NotificationBell />

            <Dropdown menu={{ items: profileItems }} trigger={['click']} placement="bottomRight">
              <Button
                shape="circle"
                icon={
                  <Avatar size="small" src="/favicon.png" style={{ backgroundColor: 'transparent' }}>
                    {currentUser?.userId?.charAt(0) || 'U'}
                  </Avatar>
                }
                style={{
                  color: mode === 'dark' ? '#e5e7eb' : '#111827',
                  borderColor: mode === 'dark' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                }}
              />
            </Dropdown>
          </Space>
        </Header>

        {/* Main Content */}
        <Content
          className="app-shell-main"
          style={{
            maxHeight: 'calc(100vh - 64px)',
            overflowY: 'auto',
            background: mode === 'dark' ? '#0f172a' : '#f8fafc',
            padding: '16px',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
