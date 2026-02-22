import { Types } from 'mongoose';

export type TFeeStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE';
export type TFeeType = 'TUITION' | 'LIBRARY' | 'EXAM' | 'HOSTEL' | 'MISC';

export type TFee = {
  student: Types.ObjectId;
  academicSemester: Types.ObjectId;
  type: TFeeType;
  amount: number;
  status: TFeeStatus;
  dueDate: Date;
  paidDate?: Date;
  transactionId?: string;
  description?: string;
  isDeleted: boolean;
};
