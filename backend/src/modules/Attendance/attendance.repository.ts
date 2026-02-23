import { BaseRepository, IBaseRepository } from '../../shared/baseRepository';
import { TAttendance } from './attendance.interface';
import { Attendance } from './attendance.model';
import { Model, PipelineStage, ClientSession } from 'mongoose';

export type IAttendanceRepository = IBaseRepository<TAttendance, TAttendance, Partial<TAttendance>>;

export class AttendanceRepository
  extends BaseRepository<TAttendance, TAttendance, Partial<TAttendance>>
  implements IAttendanceRepository
{
  constructor(model: Model<TAttendance> = Attendance) {
    super(model);
  }

  async deleteMany(
    filter: Record<string, unknown>,
    options?: { session?: ClientSession },
  ) {
    return this.model.deleteMany(filter, options);
  }

  async insertMany(
    docs: TAttendance[],
    options?: { session?: ClientSession },
  ) {
    if (options) {
      return this.model.insertMany(docs, options);
    }
    return this.model.insertMany(docs);
  }

  async aggregate(pipeline: PipelineStage[]) {
    return this.model.aggregate(pipeline);
  }

  async countDocuments(filter: Record<string, unknown> = {}) {
    return this.model.countDocuments(filter);
  }
}
