export interface PaginationOptions {
  page?: number | string;
  limit?: number | string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

export const getPaginationParams = (options?: PaginationOptions) => {
  const page = Math.max(1, parseInt(String(options?.page || 1), 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(options?.limit || 20), 10) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const paginateQuery = async <T>(
  modelOrQuery: any,
  filter: any,
  options?: PaginationOptions,
  select?: string,
  sort: any = { createdAt: -1 }
): Promise<PaginatedResult<T>> => {
  const { page, limit, skip } = getPaginationParams(options);
  const [total, data] = await Promise.all([
    modelOrQuery.countDocuments(filter),
    modelOrQuery.find(filter).select(select || '').sort(sort).skip(skip).limit(limit).lean()
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1
    }
  };
};

module.exports = {
  getPaginationParams,
  paginateQuery
};
export default { getPaginationParams, paginateQuery };
