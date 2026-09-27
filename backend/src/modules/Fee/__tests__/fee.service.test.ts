import { Types } from 'mongoose';
import { Student } from '../../Student/student.model';
import { Fee } from '../fee.model';
import { FeeServices } from '../fee.service';
import { FeeValidations } from '../fee.validation';

describe('Fee management', () => {
  afterEach(() => jest.restoreAllMocks());

  it('records a simulated payment only against the signed-in student and unpaid fee', async () => {
    const studentId = new Types.ObjectId();
    jest
      .spyOn(Student, 'findOne')
      .mockReturnValue({ select: jest.fn().mockResolvedValue({ _id: studentId }) } as never);
    const update = jest.spyOn(Fee, 'findOneAndUpdate').mockResolvedValue({ status: 'PAID' } as never);

    await FeeServices.payFee(new Types.ObjectId().toString(), 'student-1');

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        student: studentId,
        status: { $in: ['PENDING', 'OVERDUE'] },
        isDeleted: { $ne: true },
      }),
      expect.objectContaining({ status: 'PAID', transactionId: expect.stringMatching(/^SIM-/) }),
      expect.objectContaining({ returnDocument: 'after' }),
    );
  });

  it('rejects a payment when the signed-in student does not exist', async () => {
    jest.spyOn(Student, 'findOne').mockReturnValue({ select: jest.fn().mockResolvedValue(null) } as never);
    const update = jest.spyOn(Fee, 'findOneAndUpdate');
    await expect(FeeServices.payFee(new Types.ObjectId().toString(), 'missing')).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(update).not.toHaveBeenCalled();
  });

  it('does not allow editing a paid fee', async () => {
    jest.spyOn(Fee, 'findById').mockResolvedValue({ status: 'PAID' } as never);
    const update = jest.spyOn(Fee, 'findOneAndUpdate');
    await expect(FeeServices.updateFee(new Types.ObjectId().toString(), { amount: 20 })).rejects.toMatchObject({
      statusCode: 409,
    });
    expect(update).not.toHaveBeenCalled();
  });

  it('requires a valid fee type and positive numeric amount', () => {
    const body = {
      student: new Types.ObjectId().toString(),
      academicSemester: new Types.ObjectId().toString(),
      type: 'TUITION',
      amount: 100,
      dueDate: '2026-10-01',
    };
    expect(FeeValidations.createFee.safeParse({ body }).success).toBe(true);
    expect(FeeValidations.createFee.safeParse({ body: { ...body, type: 'Tuition' } }).success).toBe(false);
    expect(FeeValidations.createFee.safeParse({ body: { ...body, amount: '100' } }).success).toBe(false);
  });
});
