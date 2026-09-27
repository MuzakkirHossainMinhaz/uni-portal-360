import type { Model } from 'mongoose';
import type { IBaseRepository } from '../../shared/baseRepository';
import { BaseRepository } from '../../shared/baseRepository';
import type { TAcademicSemester } from './academicSemester.interface';
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
