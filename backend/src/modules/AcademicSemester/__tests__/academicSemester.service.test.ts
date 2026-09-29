import { AcademicSemesterRepository } from '../academicSemester.repository';
import { AcademicSemesterServices } from '../academicSemester.service';
import type { TAcademicSemester } from '../academicSemester.interface';
import { AcademicSemester } from '../academicSemester.model';

const semester: TAcademicSemester = {
  name: 'Autumn',
  code: '01',
  year: '2026',
  startMonth: 'January',
  endMonth: 'April',
};

describe('AcademicSemesterServices', () => {
  afterEach(() => jest.restoreAllMocks());

  it('rejects a mismatched name and code before creating', async () => {
    const create = jest.spyOn(AcademicSemesterRepository.prototype, 'create').mockResolvedValue(semester);

    await expect(AcademicSemesterServices.createAcademicSemester({ ...semester, code: '02' })).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(create).not.toHaveBeenCalled();
  });

  it('requires name and code to be updated together', async () => {
    const update = jest.spyOn(AcademicSemesterRepository.prototype, 'updateById').mockResolvedValue(semester);

    await expect(
      AcademicSemesterServices.updateAcademicSemester('semester-id', { name: 'Summer' }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(update).not.toHaveBeenCalled();
  });

  it('passes a valid update to the repository', async () => {
    const update = jest.spyOn(AcademicSemesterRepository.prototype, 'updateById').mockResolvedValue(semester);
    jest.spyOn(AcademicSemester, 'findById').mockResolvedValue(semester as never);
    jest.spyOn(AcademicSemester, 'exists').mockResolvedValue(null);

    await AcademicSemesterServices.updateAcademicSemester('semester-id', {
      name: 'Autumn',
      code: '01',
    });

    expect(update).toHaveBeenCalledWith('semester-id', { name: 'Autumn', code: '01' });
  });
});
