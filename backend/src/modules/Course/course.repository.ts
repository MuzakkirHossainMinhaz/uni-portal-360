import { Model } from 'mongoose';
import { BaseRepository } from '../../shared/baseRepository';
import { TCourse } from './course.interface';
import { Course } from './course.model';

export class CourseRepository extends BaseRepository<TCourse> {
  constructor(model: Model<TCourse> = Course) {
    super(model);
  }
}
