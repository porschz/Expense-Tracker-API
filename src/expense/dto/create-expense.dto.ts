import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsDateString,
  IsOptional,
  Min,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ExpenseCategory } from '../expense-category.enum';

export class CreateExpenseDto {
  @ApiProperty({
    description: 'Title or name of the expense',
    example: 'Grocery Shopping',
    minLength: 1,
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Amount of the expense',
    example: 125.5,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Date when the expense occurred (ISO 8601 format)',
    example: '2024-01-15',
    type: String,
  })
  @IsNotEmpty()
  @IsDateString()
  expenseDate: string;

  @ApiProperty({
    description: 'Category of the expense',
    enum: ExpenseCategory,
    example: ExpenseCategory.FOOD,
  })
  @IsNotEmpty()
  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @ApiProperty({
    description: 'Additional notes or description about the expense',
    example: 'Weekly groceries from Whole Foods',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
