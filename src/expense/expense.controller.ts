import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { FilterExpenseDto } from './dto/filter-expense.dto';
import { ExpenseResponseDto } from './dto/expense-response.dto';

@ApiTags('Expenses')
@ApiBearerAuth('JWT-auth')
@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Get()
  @ApiOperation({ summary: 'Get all expenses' })
  @ApiResponse({
    status: 200,
    description: 'List of all expenses',
    type: [ExpenseResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  findAll(@Request() req, @Query() filterDto: FilterExpenseDto) {
    return this.expenseService.findAll(req.user.sub, filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Expense ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Expense found',
    type: ExpenseResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Expense not found',
  })
  findOne(@Param('id') id: string, @Request() req) {
    return this.expenseService.findOne(id, req.user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new expense' })
  @ApiResponse({
    status: 201,
    description: 'Expense created successfully',
    type: ExpenseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  create(@Request() req, @Body() createExpenseDto: CreateExpenseDto) {
    return this.expenseService.create(req.user.sub, createExpenseDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an expense' })
  @ApiParam({ name: 'id', type: String, description: 'Expense ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Expense updated successfully',
    type: ExpenseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Expense not found',
  })
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expenseService.update(id, req.user.sub, updateExpenseDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an expense' })
  @ApiParam({ name: 'id', type: String, description: 'Expense ID (UUID)' })
  @ApiResponse({
    status: 204,
    description: 'Expense deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Expense not found',
  })
  async remove(@Param('id') id: string, @Request() req) {
    await this.expenseService.remove(id, req.user.sub);
  }
}
