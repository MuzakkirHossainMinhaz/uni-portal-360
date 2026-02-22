import { Schema, model } from 'mongoose';
import { TAttendance } from './attendance.interface';

const attendanceSchema = new Schema<TAttendance>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    offeredCourse: {
      type: Schema.Types.ObjectId,
      ref: 'OfferedCourse',
      required: true,
    },
    semesterRegistration: {
      type: Schema.Types.ObjectId,
      ref: 'SemesterRegistration',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late'],
      default: 'Absent',
      required: true,
    },
    remark: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index to prevent duplicate attendance for the same student, course, and date
attendanceSchema.index({ student: 1, offeredCourse: 1, date: 1 }, { unique: true });

export const Attendance = model<TAttendance>('Attendance', attendanceSchema);
