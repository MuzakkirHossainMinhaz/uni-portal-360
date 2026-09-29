import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useRequestPasswordResetMutation, useResetPasswordMutation } from '../redux/features/auth/auth.api';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const id = params.get('id');
  const token = params.get('token');
  const [requestReset, { isLoading: requesting }] = useRequestPasswordResetMutation();
  const [resetPassword, { isLoading: resetting }] = useResetPasswordMutation();
  const [status, setStatus] = useState('');

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <Card style={{ width: '100%', maxWidth: 440 }}>
        <Typography.Title level={3}>{id && token ? 'Set a new password' : 'Reset your password'}</Typography.Title>
        {status && <Alert showIcon type="info" message={status} style={{ marginBottom: 16 }} />}
        {id && token ? (
          <Form
            layout="vertical"
            onFinish={async ({ newPassword }: { newPassword: string }) => {
              try {
                await resetPassword({ id, token, newPassword }).unwrap();
                setStatus('Password updated. You can sign in now.');
              } catch {
                setStatus('The link is invalid or expired. Request a new one.');
              }
            }}
          >
            <Form.Item name="newPassword" label="New password" rules={[{ required: true }, { min: 12, max: 128 }]}>
              <Input.Password autoComplete="new-password" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={resetting}>
              Reset password
            </Button>
          </Form>
        ) : (
          <Form
            layout="vertical"
            onFinish={async ({ userId }: { userId: string }) => {
              try {
                await requestReset(userId).unwrap();
                setStatus('If this account can receive email, a reset link has been sent.');
              } catch {
                setStatus('Unable to send a reset link. Contact an administrator.');
              }
            }}
          >
            <Form.Item name="userId" label="University user ID" rules={[{ required: true }]}>
              <Input autoComplete="username" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={requesting}>
              Send reset link
            </Button>
          </Form>
        )}
        <div style={{ marginTop: 16 }}>
          <Link className="auth-link" to="/login">
            Back to sign in
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ResetPassword;
