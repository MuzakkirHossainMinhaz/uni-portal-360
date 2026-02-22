import { Schema, model } from 'mongoose';
import { TSubmission } from './submission.interface';

const submissionSchema = new Schema<TSubmission>(
  {
    assignment: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    grade: {
      type: Number,
    },
    feedback: {
      type: String,
    },
    isGraded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Compound unique index to prevent duplicate submissions for the same assignment by the same student
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

export const Submission = model<TSubmission>('Submission', submissionSchema);
