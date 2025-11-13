import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('default')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health/db')
  @ApiOperation({ summary: 'Check database connection health' })
  @ApiResponse({
    status: 200,
    description: 'Database connection status',
    schema: {
      example: {
        status: 'success',
        database: 'test_api',
        message: 'Database connection is healthy',
      },
    },
  })
  async checkDatabase() {
    return this.appService.checkDatabaseConnection();
  }
}
