import { Form } from 'antd';
import { ReactNode } from 'react';
import { FieldValues, FormProvider, Resolver, SubmitHandler, useForm } from 'react-hook-form';

type TFormConfig<TFieldValues extends FieldValues = FieldValues> = {
  defaultValues?: Record<string, unknown>;
  resolver?: Resolver<TFieldValues, any>;
};

type TFormProps<TFieldValues extends FieldValues = FieldValues> = {
  onSubmit: SubmitHandler<TFieldValues>;
  children: ReactNode;
} & TFormConfig<TFieldValues>;

const UniForm = <TFieldValues extends FieldValues = FieldValues>({
  onSubmit,
  children,
  defaultValues,
  resolver,
}: TFormProps<TFieldValues>) => {
  const formConfig: TFormConfig<TFieldValues> = {};

  if (defaultValues) {
    formConfig.defaultValues = defaultValues;
  }

  if (resolver) {
    formConfig.resolver = resolver;
  }

  const methods = useForm<TFieldValues>(formConfig as any);

  const submit: SubmitHandler<TFieldValues> = (data) => {
    onSubmit(data);
    methods.reset();
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
