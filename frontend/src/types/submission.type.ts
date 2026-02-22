export type TSubmissionStudent = {
  _id: string;
  id: string;
  fullName: string;
};

export type TSubmission = {
  _id: string;
  student: TSubmissionStudent;
  assignment: string;
  fileUrl: string;
  grade?: number;
  feedback?: string;
  submittedAt: string;
};

