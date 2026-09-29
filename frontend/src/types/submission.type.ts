export type TSubmissionStudent = {
  _id: string;
  id: string;
  fullName: string;
};

export type TSubmission = {
  _id: string;
  student: TSubmissionStudent;
  assignment: string | { _id: string; title?: string };
  fileUrl: string;
  grade?: number;
  isGraded?: boolean;
  feedback?: string;
  submittedAt: string;
  gradeCorrections?: {
    approvedBy: string;
    reason: string;
    previousGrade: number;
    newGrade: number;
    correctedAt: string;
  }[];
};
