import { BaseService } from '../../shared/baseService';
import { AcademicDepartmentSearchableFields } from './academicDepartment.constant';
import { TAcademicDepartment } from './academicDepartment.interface';
import { AcademicDepartmentRepository } from './academicDepartment.repository';

const academicDepartmentRepository = new AcademicDepartmentRepository();

class AcademicDepartmentService extends BaseService<
  TAcademicDepartment,
  TAcademicDepartment,
  Partial<TAcademicDepartment>
> {
  constructor() {
    super(academicDepartmentRepository);
  }
}

const academicDepartmentService = new AcademicDepartmentService();

export const AcademicDepartmentServices = {
  createAcademicDepartmentIntoDB: (payload: TAcademicDepartment) => academicDepartmentService.create(payload),
  getAllAcademicDepartmentsFromDB: (query: Record<string, unknown>) =>
    academicDepartmentService.getAll(query, AcademicDepartmentSearchableFields),
  getSingleAcademicDepartmentFromDB: (id: string) => academicDepartmentService.getById(id),
  updateAcademicDepartmentIntoDB: (id: string, payload: Partial<TAcademicDepartment>) =>
    academicDepartmentService.updateById(id, payload),
  deleteAcademicDepartmentFromDB: (id: string) => academicDepartmentService.deleteById(id),
};
