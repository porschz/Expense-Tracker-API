import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsNumber, Min } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'exam@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User full name',
    example: 'Example Test',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'User password',
    example: 'Qwerty123!',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'User age',
    example: 99,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  age?: number;
}
