import { Types } from 'mongoose';

export type TNotificationType = 'RESULT_PUBLISHED' | 'ASSIGNMENT_DUE' | 'SYSTEM_ANNOUNCEMENT' | 'GENERAL';
export type TNotificationPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type TNotification = {
  userId: Types.ObjectId;
  title: string;
  message: string;
  read: boolean;
  type: TNotificationType;
  priority: TNotificationPriority;
  actionUrl?: string;
  isDeleted: boolean;
};
