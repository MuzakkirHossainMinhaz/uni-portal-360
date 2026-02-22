import { Model } from 'mongoose';
import { BaseRepository, IBaseRepository } from '../../shared/baseRepository';
import { AcademicFaculty } from './academicFaculty.model';
import { TAcademicFaculty } from './academicFaculty.interface';

export interface IAcademicFacultyRepository
  extends IBaseRepository<TAcademicFaculty, TAcademicFaculty, Partial<TAcademicFaculty>> {}

export class AcademicFacultyRepository
  extends BaseRepository<TAcademicFaculty, TAcademicFaculty, Partial<TAcademicFaculty>>
  implements IAcademicFacultyRepository
{
  constructor(model: Model<TAcademicFaculty> = AcademicFaculty) {
    super(model);
  }
}

