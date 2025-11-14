import { ApiProperty } from '@nestjs/swagger';
import { ExpenseCategory } from '../expense-category.enum';

export class ExpenseResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Expense ID',
  })
  id: string;

  @ApiProperty({
    example: 'Grocery Shopping',
    description: 'Title or name of the expense',
  })
  title: string;

  @ApiProperty({
    example: 125.5,
    description: 'Amount of the expense',
  })
  amount: number;

  @ApiProperty({
    example: '2024-01-15',
    description: 'Date when the expense occurred',
  })
  expenseDate: string;

  @ApiProperty({
    enum: ExpenseCategory,
    example: ExpenseCategory.FOOD,
    description: 'Category of the expense',
  })
  category: ExpenseCategory;

  @ApiProperty({
    example: 'Weekly groceries from Whole Foods',
    description: 'Additional notes or description',
    required: false,
  })
  notes?: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User ID who owns this expense',
  })
  userId: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}
