import {
  calculateSkip,
  createPaginationResult,
  getPaginationResponse,
  PaginationResult,
} from './pagination.utils';

describe('Pagination Utils', () => {
  describe('calculateSkip', () => {
    it('should calculate skip correctly for page 1', () => {
      const result = calculateSkip(1, 10);
      expect(result).toBe(0);
    });

    it('should calculate skip correctly for page 2', () => {
      const result = calculateSkip(2, 10);
      expect(result).toBe(10);
    });

    it('should calculate skip correctly for page 3 with limit 5', () => {
      const result = calculateSkip(3, 5);
      expect(result).toBe(10);
    });

    it('should calculate skip correctly for page 5 with limit 20', () => {
      const result = calculateSkip(5, 20);
      expect(result).toBe(80);
    });

    it('should handle page 1 with limit 1', () => {
      const result = calculateSkip(1, 1);
      expect(result).toBe(0);
    });
  });

  describe('createPaginationResult', () => {
    it('should create pagination result with correct structure', () => {
      const mockData = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const result = createPaginationResult(mockData, 10, 1, 10);

      expect(result).toEqual({
        data: mockData,
        total: 10,
        page: 1,
        limit: 10,
      });
    });

    it('should handle empty data array', () => {
      const result = createPaginationResult([], 0, 1, 10);

      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });
    });

    it('should work with different page and limit values', () => {
      const mockData = [{ id: 11 }, { id: 12 }];
      const result = createPaginationResult(mockData, 25, 3, 5);

      expect(result).toEqual({
        data: mockData,
        total: 25,
        page: 3,
        limit: 5,
      });
    });
  });

  describe('getPaginationResponse', () => {
    it('should create pagination response with meta information for first page', () => {
      const mockData = [{ id: 1 }, { id: 2 }];
      const result = getPaginationResponse(mockData, 10, 2, 1);

      expect(result).toEqual({
        data: mockData,
        meta: {
          page: 1,
          limit: 2,
          total: 10,
          totalPages: 5,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      });
    });

    it('should indicate no previous page on first page', () => {
      const mockData = [{ id: 1 }];
      const result = getPaginationResponse(mockData, 10, 5, 1);

      expect(result.meta.hasPreviousPage).toBe(false);
      expect(result.meta.hasNextPage).toBe(true);
    });

    it('should indicate no next page on last page', () => {
      const mockData = [{ id: 10 }];
      const result = getPaginationResponse(mockData, 10, 5, 2);

      expect(result.meta.hasPreviousPage).toBe(true);
      expect(result.meta.hasNextPage).toBe(false);
      expect(result.meta.totalPages).toBe(2);
    });

    it('should handle middle page correctly', () => {
      const mockData = [{ id: 11 }, { id: 12 }];
      const result = getPaginationResponse(mockData, 20, 5, 3);

      expect(result.meta.hasPreviousPage).toBe(true);
      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.totalPages).toBe(4);
    });

    it('should handle single page correctly', () => {
      const mockData = [{ id: 1 }, { id: 2 }];
      const result = getPaginationResponse(mockData, 2, 10, 1);

      expect(result.meta.totalPages).toBe(1);
      expect(result.meta.hasPreviousPage).toBe(false);
      expect(result.meta.hasNextPage).toBe(false);
    });

    it('should calculate total pages correctly with remainder', () => {
      const mockData = [{ id: 1 }];
      const result = getPaginationResponse(mockData, 11, 5, 1);

      expect(result.meta.totalPages).toBe(3);
    });

    it('should handle empty results', () => {
      const result = getPaginationResponse([], 0, 10, 1);

      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
      expect(result.meta.hasNextPage).toBe(false);
      expect(result.meta.hasPreviousPage).toBe(false);
    });
  });
});
