import { Button, Col, Image, Row, Typography } from 'antd';
import { FieldValues } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import UniForm from '../components/form/UniForm';
import UniInput from '../components/form/UniInput';
import { useLoginMutation } from '../redux/features/auth/authApi';
import { TUser, setUser } from '../redux/features/auth/authSlice';
import { useAppDispatch } from '../redux/hooks';
import { verifyToken } from '../utils/verifyToken';

const { Title, Paragraph, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [login] = useLoginMutation();

  const onSubmit = async (data: FieldValues) => {
    const toastId = toast.loading('Logging in');

    try {
      const userInfo = {
        id: data.userId,
        password: data.password,
      };
      const res = await login(userInfo).unwrap();

      if (!res.data) {
        throw new Error('No data returned from login');
      }

      const user = verifyToken(res.data.accessToken) as TUser;
      dispatch(setUser({ user: user, token: res.data.accessToken }));
      toast.success('Logged in', { id: toastId, duration: 2000 });

      if (res.data.needsPasswordChange) {
        navigate(`/change-password`);
      } else {
        if (user.role === 'superAdmin') {
          navigate(`/admin/dashboard`);
        } else {
          navigate(`/${user.role}/dashboard`);
        }
      }
    } catch {
      toast.error('Something went wrong', { id: toastId, duration: 2000 });
    }
  };

  return (
    <Row
      justify="center"
      align="middle"
      style={{
        minHeight: '100vh',
        padding: '48px 16px',
        background: 'radial-gradient(circle at top left, #0b1120 0, #020617 40%, #020617 100%)',
      }}
      gutter={[48, 48]}
    >
      <Col xs={24} md={12} lg={10}>
        <div
          style={{
            maxWidth: 520,
            margin: '0 auto',
            background: 'rgba(15,23,42,0.96)',
            borderRadius: 24,
            padding: '40px 40px 44px',
            boxShadow: '0 32px 80px rgba(15,23,42,0.9)',
            border: '1px solid rgba(148,163,184,0.35)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 24,
              gap: 12,
            }}
          >
            <Image src="/logo.png" alt="Uni Portal 360" preview={false} width={100} />
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ margin: 0, color: '#e5e7eb', letterSpacing: 0.6, fontWeight: 700 }}>
                Uni Portal 360
              </Title>
              <Paragraph
                style={{
                  margin: 0,
                  marginTop: 4,
                  color: '#9ca3af',
                  fontSize: 13,
                }}
              >
                Sign in to access dashboards, courses, and analytics.
              </Paragraph>
            </div>
          </div>
          <UniForm onSubmit={onSubmit}>
            <UniInput required type="text" name="userId" label="User ID" />
            <UniInput required type="password" name="password" label="Password" />
            <Button htmlType="submit" type="primary" size="large" block style={{ marginTop: 8 }}>
              Sign in
            </Button>
          </UniForm>
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Text style={{ color: '#6b7280', fontSize: 12 }}>
              Use your university credentials. Contact your administrator if you need help.
            </Text>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default Login;
