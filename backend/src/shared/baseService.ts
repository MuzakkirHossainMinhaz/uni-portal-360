import { IBaseRepository, TPaginatedResult } from './baseRepository';

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

  getById(id: string): Promise<T | null> {
    return this.repository.findById(id);
  }

  getAll(query: Record<string, unknown>, searchableFields?: string[]): Promise<TPaginatedResult<T>> {
    return this.repository.findAll(query, searchableFields);
  }

  updateById(id: string, payload: TUpdate): Promise<T | null> {
    return this.repository.updateById(id, payload);
  }

  deleteById(id: string): Promise<T | null> {
    return this.repository.deleteById(id);
  }
}
