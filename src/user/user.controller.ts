import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('default')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('user')
  @ApiTags('user')
  @ApiOperation({ summary: 'Get users' })
  @ApiResponse({
    status: 200,
    description: 'List of users',
    schema: {
      example: {
        message: 'List of users',
      },
    },
  })
  async getUsers() {
    return this.userService.getUsers();
  }
}
