import { Schema, model } from 'mongoose';
import { TNotification } from './notification.interface';

const notificationSchema = new Schema<TNotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ['RESULT_PUBLISHED', 'ASSIGNMENT_DUE', 'SYSTEM_ANNOUNCEMENT', 'GENERAL'],
      default: 'GENERAL',
    },
    priority: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM',
    },
    actionUrl: {
      type: String,
      maxlength: 500,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for efficient unread count queries
notificationSchema.index({ userId: 1, read: 1 });

// Query Middleware to exclude deleted notifications
notificationSchema.pre('find', function () {
  this.find({ isDeleted: { $ne: true } });
});

notificationSchema.pre('findOne', function () {
  this.find({ isDeleted: { $ne: true } });
});

export const Notification = model<TNotification>('Notification', notificationSchema);
