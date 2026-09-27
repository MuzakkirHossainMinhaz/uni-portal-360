import { hasTimeConflict } from '../../modules/OfferedCourse/offeredCourse.utils';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { getPagination } from '../pagination';
import validateRequest from '../../middlewares/validateRequest';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getRouteParam } from '../getRouteParam';

const model = mongoose.model('QueryQualityTest', new mongoose.Schema({ owner: String, title: String }));
describe('shared query and request boundaries', () => {
  it('reads a scalar route parameter without changing the identifier', () => {
    expect(getRouteParam({ params: { id: 'abc-123' } } as unknown as Request, 'id')).toBe('abc-123');
  });
  it.each([{ id: undefined }, { id: '' }, { id: '  ' }, { id: ['first', 'second'] }])(
    'rejects an invalid route identifier %j',
    ({ id }) => {
      expect(() => getRouteParam({ params: { id } } as unknown as Request, 'id')).toThrow(
        'Invalid route parameter: id',
      );
    },
  );
  it.each([
    { page: '-1', limit: '0' },
    { page: 'Infinity', limit: 'bad' },
    { page: '1.2', limit: '-20' },
  ])('normalizes invalid pagination %j', (query) => {
    expect(getPagination(query)).toEqual({ page: 1, limit: 10, skip: 0 });
  });
  it('caps excessive page size', () => expect(getPagination({ limit: '999' }).limit).toBe(100));
  it('preserves server ownership when the client requests another owner', () => {
    const query = new QueryBuilder(model.find({ owner: 'current' }), { owner: 'other', page: 1 }).filter();
    expect(query.modelQuery.getFilter()).toEqual({ owner: 'current', $and: [{ owner: 'other' }] });
  });
  it('treats search metacharacters literally and ignores search without searchable fields', () => {
    const query = new QueryBuilder(model.find(), { searchTerm: '.*' }).search(['title']);
    expect(query.modelQuery.getFilter()).toEqual({ $or: [{ title: { $regex: '\\.\\*', $options: 'i' } }] });
    expect(new QueryBuilder(model.find(), { searchTerm: 'x' }).search([]).modelQuery.getFilter()).toEqual({});
  });
  it('passes transformed and stripped body values to the handler', async () => {
    const request = { body: { amount: '12', owner: 'injected' } } as Request;
    const middleware = validateRequest(
      z.object({ body: z.object({ amount: z.coerce.number(), active: z.boolean().default(true) }) }),
    );
    await new Promise<void>((resolve, reject) =>
      middleware(request, {} as Response, ((error?: unknown) => (error ? reject(error) : resolve())) as NextFunction),
    );
    expect(request.body).toEqual({ amount: 12, active: true });
  });
});

describe('course schedule conflicts', () => {
  const scheduled = [{ days: ['Sun' as const], startTime: '09:00', endTime: '10:00' }];
  it('allows the same time on different days', () =>
    expect(hasTimeConflict(scheduled, { days: ['Mon'], startTime: '09:00', endTime: '10:00' })).toBe(false));
  it('rejects overlapping times on a shared day', () =>
    expect(hasTimeConflict(scheduled, { days: ['Sun'], startTime: '09:30', endTime: '10:30' })).toBe(true));
  it('allows adjacent time slots', () =>
    expect(hasTimeConflict(scheduled, { days: ['Sun'], startTime: '10:00', endTime: '11:00' })).toBe(false));
});
