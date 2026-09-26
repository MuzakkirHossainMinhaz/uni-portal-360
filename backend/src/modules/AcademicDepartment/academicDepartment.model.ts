import httpStatus from 'http-status';
import { Schema, model } from 'mongoose';
import AppError from '../../errors/AppError';
import { TAcademicDepartment } from './academicDepartment.interface';

const academicDepartmentSchema = new Schema<TAcademicDepartment>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    academicFaculty: {
      type: Schema.Types.ObjectId,
      ref: 'AcademicFaculty',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

academicDepartmentSchema.pre('save', async function () {
  const isDepartmentExist = await AcademicDepartment.findOne({
    name: this.name,
  });

  if (isDepartmentExist) {
    throw new AppError(httpStatus.CONFLICT, 'Academic department already exists');
  }
});

academicDepartmentSchema.pre('findOneAndUpdate', async function () {
  const query = this.getQuery();
  const isDepartmentExist = await AcademicDepartment.findOne(query as Record<string, unknown>);

  if (!isDepartmentExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'This department does not exist! ');
  }
});

export const AcademicDepartment = model<TAcademicDepartment>('AcademicDepartment', academicDepartmentSchema);
