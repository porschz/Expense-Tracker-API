import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'uuid-string', description: 'User ID' })
  id: string;

  @ApiProperty({ example: 'exam@example.com', description: 'User email address' })
  email: string;

  @ApiProperty({ example: 'Example Test', description: 'User full name' })
  name: string;

  @ApiProperty({ example: 99, description: 'User age', required: false })
  age?: number;

  @ApiProperty({ example: true, description: 'User active status' })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Last update timestamp' })
  updatedAt: Date;
}
