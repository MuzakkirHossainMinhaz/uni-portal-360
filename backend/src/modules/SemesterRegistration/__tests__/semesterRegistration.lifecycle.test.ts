import { SemesterRegistrationService } from '../semesterRegistration.service';
import { SemesterRegistration } from '../semesterRegistration.model';

describe('Semester registration lifecycle', () => {
  afterEach(() => jest.restoreAllMocks());

  it('rejects skipping directly from upcoming to ended', async () => {
    jest.spyOn(SemesterRegistration, 'findById').mockResolvedValue({ status: 'UPCOMING' } as never);
    const update = jest.spyOn(SemesterRegistration, 'findByIdAndUpdate');
    await expect(SemesterRegistrationService.updateSemesterRegistrationIntoDB('registration-id', { status: 'ENDED' }))
      .rejects.toMatchObject({ statusCode: 400 });
    expect(update).not.toHaveBeenCalled();
  });

  it('does not allow dates to change during an ongoing semester', async () => {
    jest.spyOn(SemesterRegistration, 'findById').mockResolvedValue({ status: 'ONGOING' } as never);
    const update = jest.spyOn(SemesterRegistration, 'findByIdAndUpdate');
    await expect(SemesterRegistrationService.updateSemesterRegistrationIntoDB('registration-id', {
      startDate: new Date('2026-01-01'),
    })).rejects.toMatchObject({ statusCode: 400 });
    expect(update).not.toHaveBeenCalled();
  });
});
