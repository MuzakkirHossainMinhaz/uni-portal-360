import type { Model } from 'mongoose';
import type { IBaseRepository } from '../../shared/baseRepository';
import { BaseRepository } from '../../shared/baseRepository';
import type { TAcademicFaculty } from './academicFaculty.interface';
import { AcademicFaculty } from './academicFaculty.model';

export type IAcademicFacultyRepository = IBaseRepository<TAcademicFaculty, TAcademicFaculty, Partial<TAcademicFaculty>>;

export class AcademicFacultyRepository
  extends BaseRepository<TAcademicFaculty, TAcademicFaculty, Partial<TAcademicFaculty>>
  implements IAcademicFacultyRepository
{
  constructor(model: Model<TAcademicFaculty> = AcademicFaculty) {
    super(model);
  }
}
