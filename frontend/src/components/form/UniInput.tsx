import { Form, Input } from 'antd';
import { Controller } from 'react-hook-form';
import UniDatePicker from './UniDatePicker';

type TInputProps = {
  type: string;
  name: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
};

const UniInput = ({ type, name, label, disabled, required }: TInputProps) => {
  if (type === 'date') {
    return <UniDatePicker name={name} label={label} required={required} disabled={disabled} />;
  }
  const isPassword = type === 'password';

  return (
    <div style={{ marginBottom: '12px' }}>
      <Controller
        name={name}
        render={({ field }) => (
          <Form.Item label={label} required={required}>
            {isPassword ? (
              <Input.Password {...field} id={name} size="large" disabled={disabled} required={required} />
            ) : (
              <Input {...field} type={type} id={name} size="large" disabled={disabled} required={required} />
            )}
          </Form.Item>
        )}
      />
    </div>
  );
};

export default UniInput;
