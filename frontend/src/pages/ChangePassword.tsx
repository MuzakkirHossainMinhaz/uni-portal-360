import { Button, Row } from 'antd';
import UniForm from '../components/form/UniForm';
import UniInput from '../components/form/UniInput';
import { FieldValues, SubmitHandler } from 'react-hook-form';
import { useChangePasswordMutation } from '../redux/features/admin/userManagement.api';
import { useAppDispatch } from '../redux/hooks';
import { logout } from '../redux/features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
  const [changePassword] = useChangePasswordMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const payload = {
      oldPassword: data.oldPassword as string,
      newPassword: data.newPassword as string,
    };

    await changePassword(payload).unwrap();
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Row justify="center" align="middle" style={{ height: '100vh' }}>
      <UniForm onSubmit={onSubmit}>
        <UniInput type="text" name="oldPassword" label="Old Password" />
        <UniInput type="text" name="newPassword" label="New Password" />
        <Button htmlType="submit">Login</Button>
      </UniForm>
    </Row>
  );
};

export default ChangePassword;
