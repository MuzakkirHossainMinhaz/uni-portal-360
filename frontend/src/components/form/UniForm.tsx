import { Form } from 'antd';
import { ReactElement, ReactNode, useImperativeHandle, forwardRef } from 'react';
import { FieldValues, FormProvider, Resolver, SubmitHandler, useForm } from 'react-hook-form';

type TFormConfig<TFieldValues extends FieldValues = FieldValues> = {
  defaultValues?: Record<string, unknown>;
  resolver?: Resolver<TFieldValues, any>;
};

export type UniFormHandle = {
  reset: () => void;
};

type TFormProps<TFieldValues extends FieldValues = FieldValues> = {
  onSubmit: SubmitHandler<TFieldValues>;
  children: ReactNode;
  /**
   * When true, the form will reset automatically after a successful submit.
   * Defaults to false — callers control reset via the ref handle.
   */
  resetOnSubmit?: boolean;
} & TFormConfig<TFieldValues>;

/**
 * UniForm — react-hook-form wrapper.
 *
 * Exposes a ref handle with `reset()` so the parent can control when to reset.
 * By default it does NOT auto-reset after submit (error-safe pattern).
 * Pass resetOnSubmit={true} for simple forms (Login, CreateCourse, etc.)
 * where auto-reset on every submit is fine.
 */
const UniForm = forwardRef<UniFormHandle, TFormProps>(
  ({ onSubmit, children, defaultValues, resolver, resetOnSubmit = false }, ref) => {
    const formConfig: TFormConfig = {};

    if (defaultValues) formConfig.defaultValues = defaultValues;
    if (resolver) formConfig.resolver = resolver;

    const methods = useForm(formConfig as any);

    // Expose reset() to parent via ref
    useImperativeHandle(ref, () => ({
      reset: () => methods.reset(),
    }));

    const submit: SubmitHandler<FieldValues> = (data) => {
      if (resetOnSubmit) {
        // Old behaviour: always reset (safe for non-modal forms like Login)
        onSubmit(data as any);
        methods.reset();
      } else {
        // New behaviour: do NOT reset — parent decides when to reset
        onSubmit(data as any);
      }
    };

    return (
      <FormProvider {...methods}>
        <Form layout="vertical" onFinish={methods.handleSubmit(submit)}>
          {children}
        </Form>
      </FormProvider>
    );
  },
) as <TFieldValues extends FieldValues = FieldValues>(
  props: TFormProps<TFieldValues> & { ref?: React.Ref<UniFormHandle> },
) => ReactElement;

export default UniForm;
