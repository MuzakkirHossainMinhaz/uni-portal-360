import { Button, Layout, Row, Col, Typography, Space, Avatar } from 'antd';
import Sidebar from './Sidebar';
import { useAppDispatch } from '../../redux/hooks';
import { logout } from '../../redux/features/auth/authSlice';
import { Outlet } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const { Header, Content } = Layout;
const { Text } = Typography;

const MainLayout = () => {
  const dispatch = useAppDispatch();

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
              <Text style={{ color: '#e5e7eb', fontSize: 16, fontWeight: 600 }}>
                Uni Portal 360
              </Text>
              <Text style={{ color: '#9ca3af', display: 'block', fontSize: 12 }}>
                Intelligent University Management
              </Text>
            </div>
          </Space>
          <Row justify="end" align="middle" gutter={16}>
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
