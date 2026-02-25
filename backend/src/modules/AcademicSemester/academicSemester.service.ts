import { BaseService } from '../../shared/baseService';
import { AcademicSemesterSearchableFields, academicSemesterNameCodeMapper } from './academicSemester.constant';
import { TAcademicSemester } from './academicSemester.interface';
import { AcademicSemesterRepository } from './academicSemester.repository';

const academicSemesterRepository = new AcademicSemesterRepository();

class AcademicSemesterService extends BaseService<TAcademicSemester, TAcademicSemester, Partial<TAcademicSemester>> {
  constructor() {
    super(academicSemesterRepository);
  }

  async create(payload: TAcademicSemester): Promise<TAcademicSemester> {
    if (academicSemesterNameCodeMapper[payload.name] !== payload.code) {
      throw new Error('Invalid Semester Code');
    }
    return super.create(payload);
  }

  async updateById(id: string, payload: Partial<TAcademicSemester>): Promise<TAcademicSemester | null> {
    if (payload.name && payload.code && academicSemesterNameCodeMapper[payload.name] !== payload.code) {
      throw new Error('Invalid Semester Code');
    }
    return super.updateById(id, payload);
  }
}

const academicSemesterService = new AcademicSemesterService();

export const AcademicSemesterServices = {
  createAcademicSemesterIntoDB: (payload: TAcademicSemester) => academicSemesterService.create(payload),
  getAllAcademicSemestersFromDB: (query: Record<string, unknown>) =>
    academicSemesterService.getAll(query, AcademicSemesterSearchableFields),
  getSingleAcademicSemesterFromDB: (id: string) => academicSemesterService.getById(id),
  updateAcademicSemesterIntoDB: (id: string, payload: Partial<TAcademicSemester>) =>
    academicSemesterService.updateById(id, payload),
  deleteAcademicSemesterFromDB: (id: string) => academicSemesterService.deleteById(id),
};
