import { Model } from 'mongoose';
import { BaseRepository, IBaseRepository } from '../../shared/baseRepository';
import { TAcademicFaculty } from './academicFaculty.interface';
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
