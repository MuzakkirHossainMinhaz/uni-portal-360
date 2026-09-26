import { DatePicker, Form } from 'antd';
import { Controller } from 'react-hook-form';
import dayjs from 'dayjs';
import { useDatePickerPopupWidth } from './useDatePickerPopupWidth';

type TDatePickerProps = {
  name: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
};

const UniDatePicker = ({ name, label, required, disabled }: TDatePickerProps) => {
  const { wrapperRef, popupWidth, measure } = useDatePickerPopupWidth();
  return (
    <div style={{ marginBottom: '20px' }}>
      <Controller
        name={name}
        render={({ field, fieldState: { error } }) => (
          <Form.Item label={label} required={required}>
            <div ref={wrapperRef}>
              <DatePicker
                name={field.name}
                ref={field.ref}
                value={field.value && dayjs(field.value).isValid() ? dayjs(field.value) : null}
                onChange={(date) => field.onChange(date?.format('YYYY-MM-DD') ?? '')}
                onBlur={field.onBlur}
                format="DD MMM YYYY"
                classNames={{ popup: { root: popupWidth ? 'date-picker-width-matched' : '' } }}
                styles={{ popup: { root: { width: popupWidth } } }}
                onOpenChange={(isOpen) => { if (isOpen) measure(); }}
                disabled={disabled}
                size="large"
                style={{ width: '100%' }}
              />
            </div>
            {error && <small style={{ color: 'red' }}>{error.message}</small>}
          </Form.Item>
        )}
      />
    </div>
  );
};

export default UniDatePicker;
