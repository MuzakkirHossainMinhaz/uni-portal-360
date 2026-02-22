import { Button, Layout, Row, Col } from 'antd';
import Sidebar from './Sidebar';
import { useAppDispatch } from '../../redux/hooks';
import { logout } from '../../redux/features/auth/authSlice';
import { Outlet } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const { Header, Content } = Layout;

const MainLayout = () => {
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Layout style={{ height: '100%' }}>
      <Sidebar />
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px' }}>
          <Row justify="end" align="middle" gutter={16}>
            <Col>
                <NotificationBell />
            </Col>
            <Col>
                <Button onClick={handleLogout}>Logout</Button>
            </Col>
          </Row>
        </Header>
        <Content style={{ margin: '24px 16px 0' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
