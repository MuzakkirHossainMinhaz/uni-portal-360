import { SubmitHandler } from 'react-hook-form';
import UniForm from '../../../components/form/UniForm';
import { Button, Col, Flex } from 'antd';
import UniSelect from '../../../components/form/UniSelect';
import { semesterOptions } from '../../../constants/semester';
import { monthOptions } from '../../../constants/global';
import { useAddAcademicSemesterMutation } from '../../../redux/features/admin/academicManagement.api';
import { toast } from 'sonner';
import { TResponse } from '../../../types/global';
import { TAcademicSemester } from '../../../types';

const currentYear = new Date().getFullYear();
const yearOptions = [0, 1, 2, 3, 4].map((number) => ({
  value: String(currentYear + number),
  label: String(currentYear + number),
}));

const CreateAcademicSemester = () => {
  const [addAcademicSemester] = useAddAcademicSemesterMutation();

  type AcademicSemesterFormValues = {
    name: string;
    year: string;
    startMonth: string;
    endMonth: string;
  };

  const onSubmit: SubmitHandler<AcademicSemesterFormValues> = async (data) => {
    const toastId = toast.loading('Creating...');

    const name = semesterOptions[Number(data?.name) - 1]?.label;

    const semesterData = {
      name,
      code: data.name,
      year: data.year,
      startMonth: data.startMonth,
      endMonth: data.endMonth,
    };

    try {
      const res = (await addAcademicSemester(semesterData)) as TResponse<TAcademicSemester>;
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
        <UniForm
          onSubmit={onSubmit}
        >
          <UniSelect label="Name" name="name" options={semesterOptions} />
          <UniSelect label="Year" name="year" options={yearOptions} />
          <UniSelect
            label="Start Month"
            name="startMonth"
            options={monthOptions}
          />
          <UniSelect label="End Month" name="endMonth" options={monthOptions} />

          <Button htmlType="submit">Submit</Button>
        </UniForm>
      </Col>
    </Flex>
  );
};

export default CreateAcademicSemester;
