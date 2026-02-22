import { Types } from 'mongoose';

export type TSubmission = {
  assignment: Types.ObjectId;
  student: Types.ObjectId;
  fileUrl: string;
  submittedAt: Date;
  grade?: number;
  feedback?: string;
  isGraded: boolean;
};
