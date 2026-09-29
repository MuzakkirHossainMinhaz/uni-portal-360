import httpStatus from 'http-status';
import { Schema, model } from 'mongoose';
import AppError from '../../errors/AppError';
import { AcademicSemesterCode, AcademicSemesterName, Months } from './academicSemester.constant';
import type { TAcademicSemester } from './academicSemester.interface';

const acdemicSemesterSchema = new Schema<TAcademicSemester>(
  {
    name: {
      type: String,
      required: true,
      enum: AcademicSemesterName,
    },
    year: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      enum: AcademicSemesterCode,
    },
    startMonth: {
      type: String,
      required: true,
      enum: Months,
    },
    endMonth: {
      type: String,
      required: true,
      enum: Months,
    },
  },
  {
    timestamps: true,
  },
);

acdemicSemesterSchema.index({ year: 1, name: 1 }, { unique: true });

acdemicSemesterSchema.pre('save', async function () {
  const isSemesterExists = await AcademicSemester.findOne({
    year: this.year,
    name: this.name,
    _id: { $ne: this._id },
  });

  if (isSemesterExists) {
    throw new AppError(httpStatus.CONFLICT, 'Academic semester already exists');
  }
});

export const AcademicSemester = model<TAcademicSemester>('AcademicSemester', acdemicSemesterSchema);
