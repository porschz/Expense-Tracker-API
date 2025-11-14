import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';

describe('AppService', () => {
  let service: AppService;
  let dataSource: jest.Mocked<DataSource>;

  beforeEach(async () => {
    const mockDataSource = {
      query: jest.fn(),
      options: {
        database: 'test_database',
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: getDataSourceToken(),
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
    dataSource = module.get(getDataSourceToken());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkDatabaseConnection', () => {
    it('should return success when database connection is healthy', async () => {
      dataSource.query.mockResolvedValue([{ '?column?': 1 }]);

      const result = await service.checkDatabaseConnection();

      expect(dataSource.query).toHaveBeenCalledWith('SELECT 1');
      expect(result).toEqual({
        status: 'success',
        database: 'test_database',
        message: 'Database connection is healthy',
      });
    });

    it('should return error when database connection fails', async () => {
      const errorMessage = 'Connection timeout';
      dataSource.query.mockRejectedValue(new Error(errorMessage));

      const result = await service.checkDatabaseConnection();

      expect(dataSource.query).toHaveBeenCalledWith('SELECT 1');
      expect(result).toEqual({
        status: 'error',
        database: 'test_database',
        message: errorMessage,
      });
    });

    it('should handle network errors', async () => {
      const networkError = 'ECONNREFUSED';
      dataSource.query.mockRejectedValue(new Error(networkError));

      const result = await service.checkDatabaseConnection();

      expect(result.status).toBe('error');
      expect(result.message).toBe(networkError);
      expect(result.database).toBe('test_database');
    });

    it('should include database name in response', async () => {
      dataSource.query.mockResolvedValue([{ '?column?': 1 }]);

      const result = await service.checkDatabaseConnection();

      expect(result.database).toBe('test_database');
    });
  });
});
