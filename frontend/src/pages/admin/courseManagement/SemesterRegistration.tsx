import { FieldValues, SubmitHandler } from 'react-hook-form';
import UniForm from '../../../components/form/UniForm';
import { Button, Col, Flex } from 'antd';
import UniSelect from '../../../components/form/UniSelect';
import { semesterStatusOptions } from '../../../constants/semester';

import { toast } from 'sonner';
import { useGetAllAcademicSemestersQuery } from '../../../redux/features/admin/academicManagement.api';
import UniDatePicker from '../../../components/form/UniDatePicker';
import UniInput from '../../../components/form/UniInput';
import { useAddRegisteredSemesterMutation } from '../../../redux/features/admin/courseManagement';
import { TResponse, TSemester } from '../../../types';

const SemesterRegistration = () => {
  const [addSemester] = useAddRegisteredSemesterMutation();
  const { data: academicSemester } = useGetAllAcademicSemestersQuery([
    { name: 'sort', value: 'year' },
  ]);

  const academicSemesterOptions = academicSemester?.map((item: any) => ({
    value: item._id,
    label: `${item.name} ${item.year}`,
  }));

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const toastId = toast.loading('Creating...');

    const semesterData = {
      ...data,
      minCredit: Number(data.minCredit),
      maxCredit: Number(data.maxCredit),
    };

    console.log(semesterData);

    try {
      const res = (await addSemester(semesterData)) as TResponse<TSemester>;
      if (res.error) {
        toast.error(res.error.data.message, { id: toastId });
      } else {
        toast.success('Semester created', { id: toastId });
      }
    } catch {
      toast.error('Something went wrong', { id: toastId });
    }
  };

  return (
    <Flex justify="center" align="center">
      <Col span={6}>
        <UniForm onSubmit={onSubmit}>
          <UniSelect
            label="Academic Semester"
            name="academicSemester"
            options={academicSemesterOptions}
          />

          <UniSelect
            name="status"
            label="Status"
            options={semesterStatusOptions}
          />
          <UniDatePicker name="startDate" label="Start Date" />
          <UniDatePicker name="endDate" label="End Date" />
          <UniInput type="text" name="minCredit" label="Min Credit" />
          <UniInput type="text" name="maxCredit" label="Max Credit" />

          <Button htmlType="submit">Submit</Button>
        </UniForm>
      </Col>
    </Flex>
  );
};

export default SemesterRegistration;
