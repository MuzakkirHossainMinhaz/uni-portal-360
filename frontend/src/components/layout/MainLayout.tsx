import { Button, Layout, Row, Col, Typography, Space, Avatar, Segmented, Tooltip } from 'antd';
import Sidebar from './Sidebar';
import { useAppDispatch } from '../../redux/hooks';
import { logout } from '../../redux/features/auth/authSlice';
import { Outlet } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { DesktopOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { useThemeMode } from '../../theme/ThemeProvider';

const { Header, Content } = Layout;
const { Text } = Typography;

const MainLayout = () => {
  const dispatch = useAppDispatch();
  const { mode, preference, setPreference } = useThemeMode();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Layout className="app-shell">
      <Sidebar />
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(148, 163, 184, 0.24)',
          }}
        >
          <Space size={8}>
            <Avatar
              src="/logo.png"
              alt="Uni Portal 360"
              size={32}
              style={{ backgroundColor: 'transparent' }}
            />
            <div>
              <Text
                style={{
                  color: mode === 'dark' ? '#e5e7eb' : '#111827',
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                Uni Portal 360
              </Text>
              <Text
                style={{
                  color: mode === 'dark' ? '#9ca3af' : '#6b7280',
                  display: 'block',
                  fontSize: 12,
                }}
              >
                Intelligent University Management
              </Text>
            </div>
          </Space>
          <Row justify="end" align="middle" gutter={16}>
            <Col>
              <Tooltip title="Theme">
                <Segmented
                  size="small"
                  value={preference}
                  onChange={(value) => setPreference(value as any)}
                  options={[
                    {
                      label: 'System',
                      value: 'system',
                      icon: <DesktopOutlined />,
                    },
                    {
                      label: 'Light',
                      value: 'light',
                      icon: <SunOutlined />,
                    },
                    {
                      label: 'Dark',
                      value: 'dark',
                      icon: <MoonOutlined />,
                    },
                  ]}
                />
              </Tooltip>
            </Col>
            <Col>
              <NotificationBell />
            </Col>
            <Col>
              <Button type="primary" onClick={handleLogout}>
                Logout
              </Button>
            </Col>
          </Row>
        </Header>
        <Content className="app-shell-main">
          <div className="app-shell-content">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
