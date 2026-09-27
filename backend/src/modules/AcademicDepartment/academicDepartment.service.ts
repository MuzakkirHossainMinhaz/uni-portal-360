import { BaseService } from '../../shared/baseService';
import { AcademicDepartmentSearchableFields } from './academicDepartment.constant';
import type { TAcademicDepartment } from './academicDepartment.interface';
import { AcademicDepartmentRepository } from './academicDepartment.repository';
import { ensureAcademicRecordUnused } from '../../utils/academicReferences';
import { AcademicFaculty } from '../AcademicFaculty/academicFaculty.model';
import AppError from '../../errors/AppError';

const academicDepartmentRepository = new AcademicDepartmentRepository();

class AcademicDepartmentService extends BaseService<
  TAcademicDepartment,
  TAcademicDepartment,
  Partial<TAcademicDepartment>
> {
  constructor() {
    super(academicDepartmentRepository);
  }
  async create(payload: TAcademicDepartment) {
    if (!(await AcademicFaculty.exists({ _id: payload.academicFaculty })))
      throw new AppError(404, 'Academic faculty not found');
    return super.create(payload);
  }
  async updateById(id: string, payload: Partial<TAcademicDepartment>) {
    if (payload.academicFaculty) {
      const current = await this.getById(id);
      const currentFaculty = current?.academicFaculty as unknown as { _id?: unknown } | undefined;
      if (String(currentFaculty?._id ?? current?.academicFaculty) !== String(payload.academicFaculty)) {
        await ensureAcademicRecordUnused('academicDepartment', id);
        if (!(await AcademicFaculty.exists({ _id: payload.academicFaculty })))
          throw new AppError(404, 'Academic faculty not found');
      }
    }
    return super.updateById(id, payload);
  }
  async deleteById(id: string) {
    await ensureAcademicRecordUnused('academicDepartment', id);
    return super.deleteById(id);
  }
}

const academicDepartmentService = new AcademicDepartmentService();

export const AcademicDepartmentServices = {
  createAcademicDepartment: (payload: TAcademicDepartment) => academicDepartmentService.create(payload),
  getAllAcademicDepartments: (query: Record<string, unknown>) =>
    academicDepartmentService.getAll(query, AcademicDepartmentSearchableFields),
  getSingleAcademicDepartment: (id: string) => academicDepartmentService.getById(id),
  updateAcademicDepartment: (id: string, payload: Partial<TAcademicDepartment>) =>
    academicDepartmentService.updateById(id, payload),
  deleteAcademicDepartment: (id: string) => academicDepartmentService.deleteById(id),
};
