import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsNumber, Min, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'exam@example.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Example Test', description: 'User full name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Qwerty123!', description: 'User password', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 99, description: 'User age', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  age?: number;

  @ApiProperty({ example: true, description: 'User active status', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
