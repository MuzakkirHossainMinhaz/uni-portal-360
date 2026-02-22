import { Model } from 'mongoose';
import { BaseRepository } from '../../shared/baseRepository';
import { TFee } from './fee.interface';
import { Fee } from './fee.model';

export class FeeRepository extends BaseRepository<TFee> {
  constructor(model: Model<TFee> = Fee) {
    super(model);
  }
}
