import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { BaseService } from '../../shared/baseService';
import { AcademicSemesterSearchableFields, academicSemesterNameCodeMapper } from './academicSemester.constant';
import type { TAcademicSemester } from './academicSemester.interface';
import { AcademicSemesterRepository } from './academicSemester.repository';
import { ensureAcademicRecordUnused } from '../../utils/academicReferences';
import { AcademicSemester } from './academicSemester.model';

const academicSemesterRepository = new AcademicSemesterRepository();

class AcademicSemesterService extends BaseService<TAcademicSemester, TAcademicSemester, Partial<TAcademicSemester>> {
  constructor() {
    super(academicSemesterRepository);
  }
  async deleteById(id: string) {
    await ensureAcademicRecordUnused('academicSemester', id);
    return super.deleteById(id);
  }

  async create(payload: TAcademicSemester): Promise<TAcademicSemester> {
    if (academicSemesterNameCodeMapper[payload.name] !== payload.code) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid semester name/code combination');
    }
    return super.create(payload);
  }

  async updateById(id: string, payload: Partial<TAcademicSemester>): Promise<TAcademicSemester | null> {
    if ((payload.name && !payload.code) || (!payload.name && payload.code)) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Semester name and code must be updated together');
    }
    if (payload.name && payload.code && academicSemesterNameCodeMapper[payload.name] !== payload.code) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid semester name/code combination');
    }
    const current = await AcademicSemester.findById(id);
    if (!current) throw new AppError(httpStatus.NOT_FOUND, 'Academic semester not found');
    const name = payload.name ?? current.name;
    const year = payload.year ?? current.year;
    if (await AcademicSemester.exists({ name, year, _id: { $ne: id } })) {
      throw new AppError(httpStatus.CONFLICT, 'Academic semester already exists');
    }
    return super.updateById(id, payload);
  }
}

const academicSemesterService = new AcademicSemesterService();

export const AcademicSemesterServices = {
  createAcademicSemester: (payload: TAcademicSemester) => academicSemesterService.create(payload),
  getAllAcademicSemesters: (query: Record<string, unknown>) =>
    academicSemesterService.getAll(query, AcademicSemesterSearchableFields),
  getSingleAcademicSemester: (id: string) => academicSemesterService.getById(id),
  updateAcademicSemester: (id: string, payload: Partial<TAcademicSemester>) =>
    academicSemesterService.updateById(id, payload),
  deleteAcademicSemester: (id: string) => academicSemesterService.deleteById(id),
};
