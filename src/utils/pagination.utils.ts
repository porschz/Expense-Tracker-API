export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginationResponse<T> {

}

export function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

export function createPaginationResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginationResult<T> {
  return {
    data,
    total,
    page,
    limit,
  };
}

export function getPaginationResponse<T>(
  data: T[],
  total: number,
  limit: number,
  page: number,
): PaginationResponse<T> {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    },
  };
};
