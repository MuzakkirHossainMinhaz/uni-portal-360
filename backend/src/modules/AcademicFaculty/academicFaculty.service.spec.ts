import { AcademicFacultyServices } from './academicFaculty.service';
import { AcademicFacultyRepository } from './academicFaculty.repository';

jest.mock('./academicFaculty.repository');

const MockedAcademicFacultyRepository = AcademicFacultyRepository as jest.MockedClass<
  typeof AcademicFacultyRepository
>;

describe('AcademicFacultyServices', () => {
  const query = { page: 1, limit: 10 };
  const meta = {
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1,
    hasNext: false,
  };
  const data = [{ name: 'CSE' }];

  beforeEach(() => {
    MockedAcademicFacultyRepository.mockClear();
  });

  it('getAllAcademicFacultiesFromDB_withValidQuery_returnsMetaAndResult', async () => {
    const instanceMock: Pick<
      InstanceType<typeof AcademicFacultyRepository>,
      'findAll' | 'create' | 'findById' | 'updateById'
    > = {
      findAll: jest.fn().mockResolvedValue({ meta, data }),
      create: jest.fn(),
      findById: jest.fn(),
      updateById: jest.fn(),
    };

    MockedAcademicFacultyRepository.mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_model?: unknown) => instanceMock as unknown as AcademicFacultyRepository,
    );

    const result = await AcademicFacultyServices.getAllAcademicFacultiesFromDB(query);

    expect(instanceMock.findAll).toHaveBeenCalledWith(query, ['name']);
    expect(result).toEqual({
      meta,
      result: data,
    });
  });
});
