import type { Types } from 'mongoose';

export type TSubmission = {
  assignment: Types.ObjectId;
  student: Types.ObjectId;
  fileUrl: string;
  submittedAt: Date;
  grade?: number;
  feedback?: string;
  isGraded: boolean;
  gradeCorrections?: {
    approvedBy: string;
    reason: string;
    previousGrade: number;
    newGrade: number;
    previousFeedback?: string;
    newFeedback?: string;
    correctedAt: Date;
  }[];
};
