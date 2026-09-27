import { AcademicFacultySearchableFields } from './academicFaculty.constant';
import type { TAcademicFaculty } from './academicFaculty.interface';
import { BaseService } from '../../shared/baseService';
import { AcademicFacultyRepository } from './academicFaculty.repository';
import { ensureAcademicRecordUnused } from '../../utils/academicReferences';

const academicFacultyRepository = new AcademicFacultyRepository();

class AcademicFacultyService extends BaseService<TAcademicFaculty, TAcademicFaculty, Partial<TAcademicFaculty>> {
  constructor() {
    super(academicFacultyRepository);
  }
  async deleteById(id: string) {
    await ensureAcademicRecordUnused('academicFaculty', id);
    return super.deleteById(id);
  }
}

const academicFacultyService = new AcademicFacultyService();

export const AcademicFacultyServices = {
  createAcademicFaculty: (payload: TAcademicFaculty) => academicFacultyService.create(payload),
  getAllAcademicFaculties: (query: Record<string, unknown>) =>
    academicFacultyService.getAll(query, AcademicFacultySearchableFields),
  getSingleAcademicFaculty: (id: string) => academicFacultyService.getById(id),
  updateAcademicFaculty: (id: string, payload: Partial<TAcademicFaculty>) =>
    academicFacultyService.updateById(id, payload),
  deleteAcademicFaculty: (id: string) => academicFacultyService.deleteById(id),
};
