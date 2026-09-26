import { useState } from 'react';
import { Button, Col, Row, Typography } from 'antd';
import UniForm from '../components/form/UniForm';
import UniInput from '../components/form/UniInput';
import { FieldValues, SubmitHandler } from 'react-hook-form';
import { useChangePasswordMutation } from '../redux/features/admin/userManagement.api';
import { useAppDispatch } from '../redux/hooks';
import { logout } from '../redux/features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const { Title, Paragraph } = Typography;

const ChangePassword = () => {
  const [changePassword] = useChangePasswordMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const payload = {
      oldPassword: data.oldPassword as string,
      newPassword: data.newPassword as string,
    };

    setIsSubmitting(true);
    try {
      await changePassword(payload).unwrap();
      toast.success('Password changed. Please sign in again.');
      dispatch(logout());
      navigate('/login');
    } catch (error) {
      console.error('Password change failed', error);
      toast.error('Could not change password. Please check your current password and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Row
      justify="center"
      align="middle"
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top left, #0b1120 0, #020617 40%, #020617 100%)',
        padding: '24px 16px',
      }}
    >
      <Col xs={24} sm={20} md={14} lg={10} xl={8}>
        <div
          className="login-card"
          style={{
            width: '100%',
            maxWidth: 480,
            margin: '0 auto',
            background: 'rgba(15,23,42,0.96)',
            borderRadius: 24,
            boxShadow: '0 32px 80px rgba(15,23,42,0.9)',
            border: '1px solid rgba(148,163,184,0.35)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={2} style={{ margin: 0, color: '#e5e7eb', fontWeight: 700 }}>
              Change Password
            </Title>
            <Paragraph style={{ margin: 0, marginTop: 4, color: '#9ca3af', fontSize: 13 }}>
              Please enter your current and new password to continue.
            </Paragraph>
          </div>
          <UniForm onSubmit={onSubmit}>
            <UniInput type="password" name="oldPassword" label="Old Password" required />
            <UniInput type="password" name="newPassword" label="New Password" required />
            <Button htmlType="submit" type="primary" size="large" block loading={isSubmitting} style={{ marginTop: 8 }}>
              Change Password
            </Button>
          </UniForm>
        </div>
      </Col>
    </Row>
  );
};

export default ChangePassword;
