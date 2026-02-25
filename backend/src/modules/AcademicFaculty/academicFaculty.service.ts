import { AcademicFacultySearchableFields } from './academicFaculty.constant';
import { TAcademicFaculty } from './academicFaculty.interface';
import { BaseService } from '../../shared/baseService';
import { AcademicFacultyRepository } from './academicFaculty.repository';

const academicFacultyRepository = new AcademicFacultyRepository();

class AcademicFacultyService extends BaseService<TAcademicFaculty, TAcademicFaculty, Partial<TAcademicFaculty>> {
  constructor() {
    super(academicFacultyRepository);
  }
}

const academicFacultyService = new AcademicFacultyService();

export const AcademicFacultyServices = {
  createAcademicFacultyIntoDB: (payload: TAcademicFaculty) => academicFacultyService.create(payload),
  getAllAcademicFacultiesFromDB: (query: Record<string, unknown>) => 
    academicFacultyService.getAll(query, AcademicFacultySearchableFields),
  getSingleAcademicFacultyFromDB: (id: string) => academicFacultyService.getById(id),
  updateAcademicFacultyIntoDB: (id: string, payload: Partial<TAcademicFaculty>) => 
    academicFacultyService.updateById(id, payload),
  deleteAcademicFacultyFromDB: (id: string) => academicFacultyService.deleteById(id),
};
