import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async getUsers(): Promise<{
    message: string;
  }> {
    return {
      message: 'This is a placeholder for user retrieval logic.',
    };
  }
}
