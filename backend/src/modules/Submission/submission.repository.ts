import { Model } from 'mongoose';
import { BaseRepository } from '../../shared/baseRepository';
import { TSubmission } from './submission.interface';
import { Submission } from './submission.model';

export class SubmissionRepository extends BaseRepository<TSubmission> {
  constructor(model: Model<TSubmission> = Submission) {
    super(model);
  }
}
