import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsNumber, Min, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'exam@example.com', description: 'User email address', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'Example Test', description: 'User full name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 99, description: 'User age', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  age?: number;

  @ApiProperty({ example: true, description: 'User active status', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
