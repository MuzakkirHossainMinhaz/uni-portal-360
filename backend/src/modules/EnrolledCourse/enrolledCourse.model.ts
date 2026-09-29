import mongoose, { Schema } from 'mongoose';
import { Grade } from './enrolledCourse.constant';
import type { TEnrolledCourse, TEnrolledCourseMarks } from './enrolledCourse.interface';

const courseMarksSchema = new Schema<TEnrolledCourseMarks>(
  {
    classTest1: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
    midTerm: {
      type: Number,
      min: 0,
      max: 30,
      default: null,
    },
    classTest2: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
    finalTerm: {
      type: Number,
      min: 0,
      max: 50,
      default: null,
    },
  },
  {
    _id: false,
  },
);

const enrolledCourseSchema = new Schema<TEnrolledCourse>({
  semesterRegistration: {
    type: Schema.Types.ObjectId,
    ref: 'SemesterRegistration',
    required: true,
  },
  academicSemester: {
    type: Schema.Types.ObjectId,
    ref: 'AcademicSemester',
    required: true,
  },
  academicFaculty: {
    type: Schema.Types.ObjectId,
    ref: 'AcademicFaculty',
    required: true,
  },
  academicDepartment: {
    type: Schema.Types.ObjectId,
    ref: 'AcademicDepartment',
    required: true,
  },
  offeredCourse: {
    type: Schema.Types.ObjectId,
    ref: 'OfferedCourse',
    required: true,
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  courseSnapshot: {
    title: String,
    prefix: String,
    code: Number,
    credits: Number,
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  faculty: {
    type: Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true,
  },
  isEnrolled: {
    type: Boolean,
    default: false,
  },
  courseMarks: {
    type: courseMarksSchema,
    default: {},
  },
  grade: {
    type: String,
    enum: Grade,
    default: 'NA',
  },
  gradePoints: {
    type: Number,
    min: 0,
    max: 4,
    default: 0,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  enteredMarks: { type: [String], default: [] },
  publishedAt: { type: Date },
  gradeCorrections: {
    type: [
      {
        approvedBy: { type: String, required: true },
        reason: { type: String, required: true },
        previousMarks: { type: Schema.Types.Mixed, required: true },
        newMarks: { type: Schema.Types.Mixed, required: true },
        previousGrade: { type: String, required: true },
        newGrade: { type: String, required: true },
        correctedAt: { type: Date, required: true },
      },
    ],
    default: [],
  },
});

enrolledCourseSchema.index(
  {
    student: 1,
    course: 1,
    semesterRegistration: 1,
  },
  {
    unique: true,
  },
);

enrolledCourseSchema.index({ student: 1 });
enrolledCourseSchema.index({ course: 1 });
enrolledCourseSchema.index({ semesterRegistration: 1 });
enrolledCourseSchema.index({ academicSemester: 1 });
enrolledCourseSchema.index({ academicFaculty: 1 });
enrolledCourseSchema.index({ academicDepartment: 1 });
enrolledCourseSchema.index({ offeredCourse: 1 });

const EnrolledCourse = mongoose.model<TEnrolledCourse>('EnrolledCourse', enrolledCourseSchema);

export default EnrolledCourse;
