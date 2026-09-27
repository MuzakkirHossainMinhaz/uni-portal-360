import type { Model } from 'mongoose';
import { BaseRepository } from '../../shared/baseRepository';
import type { TCourse } from './course.interface';
import { Course } from './course.model';

export class CourseRepository extends BaseRepository<TCourse> {
  constructor(model: Model<TCourse> = Course) {
    super(model);
  }
}
