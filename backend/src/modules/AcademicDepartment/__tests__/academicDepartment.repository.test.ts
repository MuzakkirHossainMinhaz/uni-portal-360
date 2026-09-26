import { Model } from 'mongoose';
import { TAcademicDepartment } from '../academicDepartment.interface';
import { AcademicDepartmentRepository } from '../academicDepartment.repository';

describe('AcademicDepartmentRepository', () => {
  it('populates departments in the list query without fetching each row again', async () => {
    const rows = [{ _id: 'department-id', name: 'Engineering' }];
    const query = {
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      getFilter: jest.fn().mockReturnValue({}),
      model: { countDocuments: jest.fn().mockResolvedValue(1) },
      then: (resolve: (value: typeof rows) => unknown) => Promise.resolve(rows).then(resolve),
    };
    const model = {
      find: jest.fn().mockReturnValue(query),
      findById: jest.fn(),
    } as unknown as Model<TAcademicDepartment>;

    const result = await new AcademicDepartmentRepository(model).findAll({ page: '1', limit: '10' });

    expect(query.populate).toHaveBeenCalledWith(['academicFaculty']);
    expect(model.findById).not.toHaveBeenCalled();
    expect(result.data).toEqual(rows);
    expect(result.meta.total).toBe(1);
  });

  it('populates the academic faculty when fetching one department', async () => {
    const query = {
      populate: jest.fn().mockReturnThis(),
      then: (resolve: (value: null) => unknown) => Promise.resolve(null).then(resolve),
    };
    const model = {
      findById: jest.fn().mockReturnValue(query),
    } as unknown as Model<TAcademicDepartment>;

    await new AcademicDepartmentRepository(model).findById('department-id');

    expect(query.populate).toHaveBeenCalledWith(['academicFaculty']);
  });
});
