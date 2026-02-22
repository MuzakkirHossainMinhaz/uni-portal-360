import { Schema, model } from 'mongoose';
import { TAssignment } from './assignment.interface';

const assignmentSchema = new Schema<TAssignment>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    offeredCourse: {
      type: Schema.Types.ObjectId,
      ref: 'OfferedCourse',
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    faculty: {
      type: Schema.Types.ObjectId,
      ref: 'Faculty',
      required: true,
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

// Query Middleware
assignmentSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

assignmentSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

assignmentSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

export const Assignment = model<TAssignment>('Assignment', assignmentSchema);
