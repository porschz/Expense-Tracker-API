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
  Res,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiProduces,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { FilterExpenseDto } from './dto/filter-expense.dto';
import { ExpenseResponseDto } from './dto/expense-response.dto';
import { PaginatedExpenseResponseDto } from './dto/paginated-expense-response.dto';
import { getPaginationResponse } from '../utils/pagination.utils';
import { ReportQueryDto } from './dto/report-query.dto';
import { CategoryReportDto } from './dto/category-report.dto';

@ApiTags('Expenses')
@ApiBearerAuth('JWT-auth')
@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Get()
  @ApiOperation({ summary: 'Get all expenses with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of expenses',
    type: PaginatedExpenseResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findAll(@Request() req, @Query() filterDto: FilterExpenseDto) {
    const { data, total, page, limit } = await this.expenseService.findAll(
      req.user.sub,
      filterDto,
    );
   return getPaginationResponse(data, total, limit, page);
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

  @Get('reports/category')
  @ApiOperation({ summary: 'Get expense report by category (JSON)' })
  @ApiResponse({
    status: 200,
    description: 'Category report generated successfully',
    type: CategoryReportDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getCategoryReport(
    @Request() req,
    @Query() queryDto: ReportQueryDto,
  ): Promise<CategoryReportDto> {
    return this.expenseService.getCategoryReport(
      req.user.sub,
      queryDto.startDate,
      queryDto.endDate,
    );
  }

  @Get('reports/category/pdf')
  @ApiOperation({ summary: 'Download expense report by category as PDF' })
  @ApiProduces('application/pdf')
  @ApiResponse({
    status: 200,
    description: 'PDF report generated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getCategoryReportPdf(
    @Request() req,
    @Query() queryDto: ReportQueryDto,
    @Res() res: Response,
  ) {
    const pdfStream = await this.expenseService.generateReportPdf(
      req.user.sub,
      queryDto.startDate,
      queryDto.endDate,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="expense-report-${queryDto.startDate}-to-${queryDto.endDate}.pdf"`,
    });

    pdfStream.pipe(res);
  }

  @Get('reports/category/excel')
  @ApiOperation({ summary: 'Download expense report by category as Excel' })
  @ApiProduces(
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @ApiResponse({
    status: 200,
    description: 'Excel report generated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getCategoryReportExcel(
    @Request() req,
    @Query() queryDto: ReportQueryDto,
    @Res() res: Response,
  ) {
    const excelBuffer = await this.expenseService.generateReportExcel(
      req.user.sub,
      queryDto.startDate,
      queryDto.endDate,
    );

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="expense-report-${queryDto.startDate}-to-${queryDto.endDate}.xlsx"`,
    });

    res.send(excelBuffer);
  }
}
