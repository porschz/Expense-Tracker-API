import { ApiProperty } from '@nestjs/swagger';
import { ExpenseCategory } from '../expense-category.enum';

export class CategorySummary {
  @ApiProperty({
    description: 'Expense category',
    enum: ExpenseCategory,
    example: ExpenseCategory.FOOD,
  })
  category: ExpenseCategory;

  @ApiProperty({
    description: 'Total amount for this category',
    example: 1234.56,
  })
  total: number;

  @ApiProperty({
    description: 'Number of expenses in this category',
    example: 15,
  })
  count: number;
}

export class CategoryReportDto {
  @ApiProperty({
    description: 'Start date of the report',
    example: '2024-01-01',
  })
  startDate: string;

  @ApiProperty({
    description: 'End date of the report',
    example: '2024-12-31',
  })
  endDate: string;

  @ApiProperty({
    description: 'Total amount across all categories',
    example: 5678.90,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Breakdown by category',
    type: [CategorySummary],
  })
  categories: CategorySummary[];
}
