import { model, Schema } from 'mongoose';

type TUserIdCounter = {
  _id: string;
  sequence: number;
};

const userIdCounterSchema = new Schema<TUserIdCounter>(
  {
    _id: { type: String, required: true },
    sequence: { type: Number, required: true, min: 0 },
  },
  { versionKey: false },
);

export const UserIdCounter = model<TUserIdCounter>('UserIdCounter', userIdCounterSchema);
