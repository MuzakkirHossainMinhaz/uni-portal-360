export type TAttendanceStatus = 'Present' | 'Absent' | 'Late';

export type TAttendance = {
  student: string; // ObjectId
  offeredCourse: string; // ObjectId
  semesterRegistration: string; // ObjectId
  date: Date;
  status: TAttendanceStatus;
  remark?: string;
};
