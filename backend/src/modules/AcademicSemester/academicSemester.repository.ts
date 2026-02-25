import { Model } from 'mongoose';
import { BaseRepository, IBaseRepository } from '../../shared/baseRepository';
import { TAcademicSemester } from './academicSemester.interface';
import { AcademicSemester } from './academicSemester.model';

export type IAcademicSemesterRepository = IBaseRepository<
  TAcademicSemester,
  TAcademicSemester,
  Partial<TAcademicSemester>
>;

export class AcademicSemesterRepository
  extends BaseRepository<TAcademicSemester, TAcademicSemester, Partial<TAcademicSemester>>
  implements IAcademicSemesterRepository
{
  constructor(model: Model<TAcademicSemester> = AcademicSemester) {
    super(model);
  }
}
