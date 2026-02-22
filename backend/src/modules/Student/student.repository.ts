import { Model } from 'mongoose';
import { BaseRepository } from '../../shared/baseRepository';
import { TStudent } from './student.interface';
import { Student } from './student.model';

export class StudentRepository extends BaseRepository<TStudent> {
  constructor(model: Model<TStudent> = Student) {
    super(model);
  }
}
