import { Button, Col, Image, Row, Typography } from 'antd';
import { FieldValues } from 'react-hook-form';
import { useLoginMutation } from '../redux/features/auth/authApi';
import { useAppDispatch } from '../redux/hooks';
import { TUser, setUser } from '../redux/features/auth/authSlice';
import { verifyToken } from '../utils/verifyToken';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PHForm from '../components/form/PHForm';
import PHInput from '../components/form/PHInput';

const { Title, Paragraph, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const defaultValues = {
    userId: '2026010016',
    password: 'student123',
  };

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
        navigate(`/${user.role}/dashboard`);
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
        padding: '32px 16px',
        background:
          'radial-gradient(circle at top left, #0b1120 0, #020617 40%, #020617 100%)',
      }}
      gutter={[48, 48]}
    >
      <Col xs={24} md={10} lg={8}>
        <div
          style={{
            maxWidth: 420,
            margin: '0 auto',
            background: 'rgba(15,23,42,0.96)',
            borderRadius: 24,
            padding: '32px 32px 40px',
            boxShadow: '0 32px 80px rgba(15,23,42,0.9)',
            border: '1px solid rgba(148,163,184,0.35)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 16 }}>
            <Image
              src="/logo.png"
              alt="Uni Portal 360"
              preview={false}
              width={52}
            />
            <div>
              <Title
                level={3}
                style={{ margin: 0, color: '#e5e7eb', letterSpacing: 0.4 }}
              >
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
                Secure access for students, faculty, and administrators.
              </Paragraph>
            </div>
          </div>
          <PHForm onSubmit={onSubmit} defaultValues={defaultValues}>
            <PHInput type="text" name="userId" label="User ID" />
            <PHInput type="password" name="password" label="Password" />
            <Button
              htmlType="submit"
              type="primary"
              size="large"
              block
              style={{ marginTop: 8 }}
            >
              Sign in
            </Button>
          </PHForm>
          <div style={{ marginTop: 16 }}>
            <Text style={{ color: '#6b7280', fontSize: 12 }}>
              Use your university credentials to access dashboards, courses, and
              analytics.
            </Text>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default Login;
