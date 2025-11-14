import { IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ExpenseCategory } from '../expense-category.enum';
import { PaginationDto } from './pagination.dto';

export class FilterExpenseDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter expenses from this date (ISO 8601 format)',
    example: '2024-01-01',
    type: String,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter expenses until this date (ISO 8601 format)',
    example: '2024-12-31',
    type: String,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Filter expenses by category',
    enum: ExpenseCategory,
    example: ExpenseCategory.FOOD,
  })
  @IsOptional()
  @IsEnum(ExpenseCategory)
  category?: ExpenseCategory;
}
