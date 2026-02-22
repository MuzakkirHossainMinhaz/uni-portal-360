import { Schema, model } from 'mongoose';
import { TSemesterResult } from './semesterResult.interface';

const semesterResultSchema = new Schema<TSemesterResult>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    academicSemester: {
      type: Schema.Types.ObjectId,
      ref: 'AcademicSemester',
      required: true,
    },
    totalCredits: {
      type: Number,
      default: 0,
    },
    totalGradePoints: {
      type: Number,
      default: 0,
    },
    gpa: {
      type: Number,
      default: 0,
    },
    completedCourses: [
      {
        type: Schema.Types.ObjectId,
        ref: 'EnrolledCourse',
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Compound unique index to ensure one result document per student per semester
semesterResultSchema.index({ student: 1, academicSemester: 1 }, { unique: true });

export const SemesterResult = model<TSemesterResult>('SemesterResult', semesterResultSchema);
