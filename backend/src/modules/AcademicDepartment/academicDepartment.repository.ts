import type { Model } from 'mongoose';
import type { IBaseRepository } from '../../shared/baseRepository';
import { BaseRepository } from '../../shared/baseRepository';
import type { TAcademicDepartment } from './academicDepartment.interface';
import { AcademicDepartment } from './academicDepartment.model';

export type IAcademicDepartmentRepository = IBaseRepository<
  TAcademicDepartment,
  TAcademicDepartment,
  Partial<TAcademicDepartment>
>;

export class AcademicDepartmentRepository
  extends BaseRepository<TAcademicDepartment, TAcademicDepartment, Partial<TAcademicDepartment>>
  implements IAcademicDepartmentRepository
{
  constructor(model: Model<TAcademicDepartment> = AcademicDepartment) {
    super(model);
  }

  protected populatePaths = ['academicFaculty'];
}
