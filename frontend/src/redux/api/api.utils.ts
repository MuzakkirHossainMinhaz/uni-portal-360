import type { TPaginatedResponse, TQueryParam, TResponse } from '../../types';

type QueryValue = string | number | bigint | boolean | null | undefined;
type QueryArgs = TQueryParam[] | Record<string, QueryValue>;

export const toQueryParams = (args?: QueryArgs): URLSearchParams => {
  const params = new URLSearchParams();
  const entries = Array.isArray(args)
    ? args.map(({ name, value }) => [name, value] as const)
    : Object.entries(args ?? {});

  for (const [name, value] of entries) {
    if (value !== undefined && value !== null && value !== '') {
      params.append(name, String(value));
    }
  }

  return params;
};

export const toPage = <T>(response: Pick<TResponse<T[]>, 'data' | 'meta'>): TPaginatedResponse<T> => ({
  data: response.data ?? [],
  meta: response.meta,
});
