import { Schema, model } from 'mongoose';
import { TFee } from './fee.interface';

const feeSchema = new Schema<TFee>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    academicSemester: {
      type: Schema.Types.ObjectId,
      ref: 'AcademicSemester',
      required: true,
    },
    type: {
      type: String,
      enum: ['TUITION', 'LIBRARY', 'EXAM', 'HOSTEL', 'MISC'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'PARTIAL', 'OVERDUE'],
      default: 'PENDING',
      index: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paidDate: {
      type: Date,
    },
    transactionId: {
      type: String,
    },
    description: {
      type: String,
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

// Indexes
feeSchema.index({ student: 1, status: 1 });
feeSchema.index({ dueDate: 1 });

// Middleware to filter deleted
feeSchema.pre('find', function () {
  this.find({ isDeleted: { $ne: true } });
});

feeSchema.pre('findOne', function () {
  this.find({ isDeleted: { $ne: true } });
});

export const Fee = model<TFee>('Fee', feeSchema);
