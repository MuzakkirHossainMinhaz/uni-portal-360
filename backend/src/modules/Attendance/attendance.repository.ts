import { BaseRepository, IBaseRepository } from '../../shared/baseRepository';
import { TAttendance } from './attendance.interface';
import { Attendance } from './attendance.model';
import { Model } from 'mongoose';

export type IAttendanceRepository = IBaseRepository<TAttendance, TAttendance, Partial<TAttendance>>;

export class AttendanceRepository extends BaseRepository<TAttendance, TAttendance, Partial<TAttendance>> implements IAttendanceRepository {
  constructor(model: Model<TAttendance> = Attendance) {
    super(model);
  }
}
