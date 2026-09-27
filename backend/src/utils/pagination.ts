export const getPagination = (query: Record<string, unknown>, defaultLimit = 10) => {
  const rawPage = Number(query.page);
  const rawLimit = Number(query.limit);
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? Math.min(rawPage, 1_000_000) : 1;
  const limit = Number.isSafeInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : defaultLimit;
  return { page, limit, skip: (page - 1) * limit };
};

export const getPaginationMeta = (total: number, page: number, limit: number) => {
  const totalPages = Math.ceil(total / limit) || 1;
  return { page, limit, total, totalPages, hasNext: page < totalPages };
};

export type TPaginationMeta = ReturnType<typeof getPaginationMeta>;
