import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async checkDatabaseConnection(): Promise<{
    status: string;
    database: string;
    message: string;
  }> {
    try {
      await this.dataSource.query('SELECT 1');

      return {
        status: 'success',
        database: this.dataSource.options.database as string,
        message: 'Database connection is healthy',
      };
    } catch (error) {
      return {
        status: 'error',
        database: this.dataSource.options.database as string,
        message: error.message,
      };
    }
  }
}
