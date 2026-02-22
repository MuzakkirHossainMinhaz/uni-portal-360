import { Model } from 'mongoose';
import { BaseRepository } from '../../shared/baseRepository';
import { TNotification } from './notification.interface';
import { Notification } from './notification.model';

export class NotificationRepository extends BaseRepository<TNotification> {
  constructor(model: Model<TNotification> = Notification) {
    super(model);
  }
}
