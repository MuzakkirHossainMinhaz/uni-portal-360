import type { IBaseRepository, TPaginatedResult } from './baseRepository';
import AppError from '../errors/AppError';

export interface IBaseService<T, TCreate = Partial<T>, TUpdate = Partial<T>> {
  create(payload: TCreate): Promise<T>;
  getById(id: string): Promise<T | null>;
  getAll(query: Record<string, unknown>, searchableFields?: string[]): Promise<TPaginatedResult<T>>;
  updateById(id: string, payload: TUpdate): Promise<T | null>;
  deleteById(id: string): Promise<T | null>;
}

export abstract class BaseService<T, TCreate = Partial<T>, TUpdate = Partial<T>> implements IBaseService<
  T,
  TCreate,
  TUpdate
> {
  protected repository: IBaseRepository<T, TCreate, TUpdate>;

  protected constructor(repository: IBaseRepository<T, TCreate, TUpdate>) {
    this.repository = repository;
  }

  create(payload: TCreate): Promise<T> {
    return this.repository.create(payload);
  }

  async getById(id: string): Promise<T | null> {
    const result = await this.repository.findById(id);
    if (!result) throw new AppError(404, 'Record not found');
    return result;
  }

  getAll(query: Record<string, unknown>, searchableFields?: string[]): Promise<TPaginatedResult<T>> {
    return this.repository.findAll(query, searchableFields);
  }

  async updateById(id: string, payload: TUpdate): Promise<T | null> {
    const result = await this.repository.updateById(id, payload);
    if (!result) throw new AppError(404, 'Record not found');
    return result;
  }

  async deleteById(id: string): Promise<T | null> {
    const result = await this.repository.deleteById(id);
    if (!result) throw new AppError(404, 'Record not found');
    return result;
  }
}
