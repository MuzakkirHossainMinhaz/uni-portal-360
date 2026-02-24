import { DatePicker, Form } from 'antd';
import { Controller } from 'react-hook-form';

type TDatePickerProps = {
  name: string;
  label?: string;
  required?: boolean;
};

const UniDatePicker = ({ name, label, required }: TDatePickerProps) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <Controller
        name={name}
        render={({ field }) => (
          <Form.Item label={label} required={required}>
            <DatePicker {...field} size="large" style={{ width: '100%' }} required={required} />
          </Form.Item>
        )}
      />
    </div>
  );
};

export default UniDatePicker;
