import { Model } from 'mongoose';
import { BaseRepository } from '../../shared/baseRepository';
import { TAssignment } from './assignment.interface';
import { Assignment } from './assignment.model';

export class AssignmentRepository extends BaseRepository<TAssignment> {
  constructor(model: Model<TAssignment> = Assignment) {
    super(model);
  }
}
