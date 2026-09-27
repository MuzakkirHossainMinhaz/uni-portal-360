import type { Query } from 'mongoose';
import { getPagination, getPaginationMeta } from '../utils/pagination';

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(searchableFields: string[]) {
    const searchTerm = this?.query?.searchTerm;
    if (typeof searchTerm === 'string' && searchTerm && searchableFields.length) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(
          (field) =>
            ({
              [field]: { $regex: searchTerm.slice(0, 200).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' },
            }) as Record<string, unknown>,
        ),
      });
    }

    return this;
  }

  filter() {
    const queryObj = { ...this.query }; // copy

    // Filtering
    const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];

    excludeFields.forEach((el) => delete queryObj[el]);

    // Keep caller-provided ownership filters separate from client filters.
    if (Object.keys(queryObj).length) this.modelQuery = this.modelQuery.and([queryObj]);

    return this;
  }

  sort() {
    const sort = typeof this.query.sort === 'string' ? this.query.sort.split(',').join(' ') : '-createdAt';
    this.modelQuery = this.modelQuery.sort(sort as string);

    return this;
  }

  paginate() {
    const { limit, skip } = getPagination(this.query);

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }

  fields() {
    const fields = typeof this.query.fields === 'string' ? this.query.fields.split(',').join(' ') : '-__v';

    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }
  async countTotal() {
    const totalQueries = this.modelQuery.getFilter();
    const total = await this.modelQuery.model.countDocuments(totalQueries);
    const { page, limit } = getPagination(this.query);
    return getPaginationMeta(total, page, limit);
  }
}

export default QueryBuilder;
