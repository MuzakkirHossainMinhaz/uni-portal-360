import assert from 'node:assert/strict';
import { test } from 'node:test';
import { toPage, toQueryParams } from '../src/redux/api/api.utils.ts';

test('query filters retain false and zero while omitting empty values', () => {
  const params = toQueryParams({ active: false, page: 0, search: '', role: undefined, faculty: null });
  assert.equal(params.toString(), 'active=false&page=0');
});

test('array filters preserve repeated keys and encode user input', () => {
  const params = toQueryParams([
    { name: 'role', value: 'student' },
    { name: 'role', value: 'faculty' },
    { name: 'searchTerm', value: 'A & B+' },
  ]);
  assert.deepEqual(params.getAll('role'), ['student', 'faculty']);
  assert.equal(new URLSearchParams(params.toString()).get('searchTerm'), 'A & B+');
});

test('unfiltered queries produce no parameters', () => {
  assert.equal(toQueryParams().toString(), '');
  assert.equal(toQueryParams([]).toString(), '');
});

test('empty responses yield an iterable list and preserve pagination', () => {
  const meta = { page: 1, limit: 10, total: 0, unreadCount: 3 };
  assert.deepEqual(toPage({ meta }), { data: [], meta });
});

test('page transformation retains records and extended metadata', () => {
  const data = [{ _id: 'notification-1', read: false }];
  const meta = { page: 1, limit: 10, total: 1, unreadCount: 1 };
  const page = toPage({ data, meta });
  assert.equal(page.data, data);
  assert.equal(page.meta.unreadCount, 1);
});
