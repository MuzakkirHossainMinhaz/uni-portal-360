import { Model } from 'mongoose';
import QueryBuilder from '../builder/QueryBuilder';

export type TPaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
};

export type TPaginatedResult<T> = {
  meta: TPaginationMeta;
  data: T[];
};

export interface IReadonlyRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(query: Record<string, unknown>, searchableFields?: string[]): Promise<TPaginatedResult<T>>;
}

export interface IWriteonlyRepository<T, TCreate = Partial<T>, TUpdate = Partial<T>> {
  create(payload: TCreate): Promise<T>;
  updateById(id: string, payload: TUpdate): Promise<T | null>;
}

export type IBaseRepository<T, TCreate = Partial<T>, TUpdate = Partial<T>> = IReadonlyRepository<T> &
  IWriteonlyRepository<T, TCreate, TUpdate>;

export abstract class BaseRepository<T, TCreate = Partial<T>, TUpdate = Partial<T>> implements IBaseRepository<
  T,
  TCreate,
  TUpdate
> {
  protected model: Model<T>;

  protected constructor(model: Model<T>) {
    this.model = model;
  }

  async findById(id: string): Promise<T | null> {
    const result = await this.model.findById(id);
    return result;
  }

  async findAll(query: Record<string, unknown>, searchableFields: string[] = []): Promise<TPaginatedResult<T>> {
    const qb = new QueryBuilder<T>(this.model.find(), query)
      .search(searchableFields)
      .filter()
      .sort()
      .paginate()
      .fields();

    const data = await qb.modelQuery;
    const meta = await qb.countTotal();

    return {
      meta,
      data,
    };
  }

  async create(payload: TCreate): Promise<T> {
    const result = await this.model.create(payload as any);
    return result as any as T;
  }

  async updateById(id: string, payload: TUpdate): Promise<T | null> {
    const result = await this.model.findOneAndUpdate({ _id: id } as any, payload as any, {
      new: true,
    });
    return result as any as T | null;
  }
}
