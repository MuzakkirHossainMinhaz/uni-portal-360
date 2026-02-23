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
assignmentSchema.pre('find', function () {
  this.find({ isDeleted: { $ne: true } });
});

assignmentSchema.pre('findOne', function () {
  this.find({ isDeleted: { $ne: true } });
});

assignmentSchema.pre('aggregate', function () {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
});

export const Assignment = model<TAssignment>('Assignment', assignmentSchema);
