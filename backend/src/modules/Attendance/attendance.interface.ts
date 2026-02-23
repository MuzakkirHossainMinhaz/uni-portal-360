import { Types } from 'mongoose';

export type TAttendanceStatus = 'Present' | 'Absent' | 'Late';

export type TAttendance = {
  student: Types.ObjectId;
  offeredCourse: Types.ObjectId;
  semesterRegistration: Types.ObjectId;
  date: Date;
  status: TAttendanceStatus;
  remark?: string;
};
