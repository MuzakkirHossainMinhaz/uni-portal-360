import { Model } from 'mongoose';
import { BaseRepository, IBaseRepository } from '../../shared/baseRepository';
import { TAcademicDepartment } from './academicDepartment.interface';
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
}
