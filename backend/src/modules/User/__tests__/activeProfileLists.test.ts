import { Admin } from '../../Admin/admin.model';
import { AdminServices } from '../../Admin/admin.service';
import { Faculty } from '../../Faculty/faculty.model';
import { FacultyServices } from '../../Faculty/faculty.service';
import { Student } from '../../Student/student.model';
import { StudentServices } from '../../Student/student.service';

describe('profile list pagination', () => {
  afterEach(() => jest.restoreAllMocks());

  it.each([
    ['admins', Admin, AdminServices.getAllAdminsFromDB],
    ['faculties', Faculty, FacultyServices.getAllFacultiesFromDB],
    ['students', Student, StudentServices.getAllStudentsFromDB],
  ])('counts only active %s', async (_label, model, list) => {
    const filter: Record<string, unknown> = {};
    const countDocuments = jest.fn().mockResolvedValue(2);
    const query = {
      model: { countDocuments },
      populate: jest.fn().mockReturnThis(),
      find: jest.fn().mockImplementation((criteria: Record<string, unknown>) => {
        Object.assign(filter, criteria);
        return query;
      }),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getFilter: jest.fn().mockImplementation(() => filter),
      then: (resolve: (value: unknown[]) => unknown) => Promise.resolve([]).then(resolve),
    };
    jest.spyOn(model, 'find').mockReturnValue(query as never);

    const result = await list({ page: '1', limit: '10' });

    expect(countDocuments).toHaveBeenCalledWith({ isDeleted: { $ne: true } });
    expect(result.meta.total).toBe(2);
  });
});
