import { Form } from 'antd';
import type { ReactNode, Ref } from 'react';
import { useImperativeHandle } from 'react';
import type { DefaultValues, FieldValues, Resolver, SubmitHandler } from 'react-hook-form';
import { FormProvider, useForm } from 'react-hook-form';

export type UniFormHandle = { reset: () => void };
type FormProps<T extends FieldValues> = {
  onSubmit: SubmitHandler<T>;
  children: ReactNode;
  defaultValues?: DefaultValues<T>;
  resolver?: Resolver<T>;
  resetOnSubmit?: boolean;
  ref?: Ref<UniFormHandle>;
};

const UniForm = <T extends FieldValues = FieldValues>({
  onSubmit,
  children,
  defaultValues,
  resolver,
  resetOnSubmit = false,
  ref,
}: FormProps<T>) => {
  const methods = useForm<T>({ defaultValues, resolver });
  useImperativeHandle(ref, () => ({ reset: () => methods.reset() }));

  const submit: SubmitHandler<T> = async (data) => {
    await onSubmit(data);
    if (resetOnSubmit) methods.reset();
  };

  return (
    <FormProvider {...methods}>
      <Form layout="vertical" onFinish={methods.handleSubmit(submit)}>
        {children}
      </Form>
    </FormProvider>
  );
};

export default UniForm;
