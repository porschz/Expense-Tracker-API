import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Expense } from './expense.model';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { FilterExpenseDto } from './dto/filter-expense.dto';
import {
  calculateSkip,
  createPaginationResult,
  PaginationResult,
} from '../utils/pagination.utils';
import { CategoryReportDto, CategorySummary } from './dto/category-report.dto';
import { ExpenseCategory } from './expense-category.enum';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
  ) {}

  async create(
    userId: string,
    createExpenseDto: CreateExpenseDto,
  ): Promise<Expense> {
    const expense = this.expenseRepository.create({
      ...createExpenseDto,
      userId,
    });
    return await this.expenseRepository.save(expense);
  }

  async findAll(
    userId: string,
    filterDto: FilterExpenseDto,
  ): Promise<PaginationResult<Expense>> {
    const { startDate, endDate, category, page = 1, limit = 10 } = filterDto;
    const where: any = { userId };

    if (startDate && endDate) {
      where.expenseDate = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.expenseDate = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      where.expenseDate = LessThanOrEqual(new Date(endDate));
    }

    if (category) {
      where.category = category;
    }

    const skip = calculateSkip(page, limit);

    const [data, total] = await this.expenseRepository.findAndCount({
      where,
      order: { expenseDate: 'DESC' },
      take: limit,
      skip: skip,
    });

    return createPaginationResult(data, total, page, limit);
  }

  async findOne(id: string, userId: string): Promise<Expense> {
    const expense = await this.expenseRepository.findOne({
      where: { id },
    });

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    if (expense.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this expense',
      );
    }

    return expense;
  }

  async update(
    id: string,
    userId: string,
    updateExpenseDto: UpdateExpenseDto,
  ): Promise<Expense> {
    const expense = await this.findOne(id, userId);

    Object.assign(expense, updateExpenseDto);
    return await this.expenseRepository.save(expense);
  }

  async remove(id: string, userId: string): Promise<void> {
    const expense = await this.findOne(id, userId);
    await this.expenseRepository.remove(expense);
  }

  async getCategoryReport(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<CategoryReportDto> {
    const expenses = await this.expenseRepository.find({
      where: {
        userId,
        expenseDate: Between(new Date(startDate), new Date(endDate)),
      },
    });

    const categoryMap = new Map<ExpenseCategory, CategorySummary>();

    Object.values(ExpenseCategory).forEach((category) => {
      categoryMap.set(category, {
        category,
        total: 0,
        count: 0,
      });
    });

    expenses.forEach((expense) => {
      const summary = categoryMap.get(expense.category);
      if (summary) {
        summary.total += Number(expense.amount);
        summary.count += 1;
      }
    });

    const categories = Array.from(categoryMap.values()).sort(
      (a, b) => b.total - a.total,
    );

    const totalAmount = categories.reduce((sum, cat) => sum + cat.total, 0);

    return {
      startDate,
      endDate,
      totalAmount,
      categories,
    };
  }

  async generateReportPdf(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<Readable> {
    const report = await this.getCategoryReport(userId, startDate, endDate);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = new Readable({
          read() {},
        });

        doc.on('data', (chunk) => stream.push(chunk));
        doc.on('end', () => {
          stream.push(null);
          resolve(stream);
        });
        doc.on('error', reject);

        doc
          .fontSize(24)
          .font('Helvetica-Bold')
          .text('Expense Report by Category', { align: 'center' });

        doc.moveDown();

        doc
          .fontSize(12)
          .font('Helvetica')
          .text(`Report Period: ${startDate} to ${endDate}`, { align: 'center' });

        doc.moveDown(2);

        doc
          .fontSize(16)
          .font('Helvetica-Bold')
          .text('Summary', { underline: true });

        doc.moveDown(0.5);

        doc
          .fontSize(14)
          .font('Helvetica')
          .text(`Total Expenses: ${report.totalAmount.toFixed(2)}`);

        doc.moveDown(2);

        doc
          .fontSize(16)
          .font('Helvetica-Bold')
          .text('Category Breakdown', { underline: true });

        doc.moveDown();

        const tableTop = doc.y;
        const col1X = 50;
        const col2X = 250;
        const col3X = 400;

        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('Category', col1X, tableTop)
          .text('Total Amount', col2X, tableTop)
          .text('Count', col3X, tableTop);

        doc.moveDown(0.5);

        doc
          .moveTo(col1X, doc.y)
          .lineTo(500, doc.y)
          .stroke();

        doc.moveDown(0.3);

        doc.font('Helvetica').fontSize(11);

        report.categories.forEach((category) => {
          if (category.count > 0) {
            const y = doc.y;

            doc
              .text(category.category, col1X, y)
              .text(`${category.total.toFixed(2)}`, col2X, y)
              .text(category.count.toString(), col3X, y);

            doc.moveDown(0.8);
          }
        });

        doc.moveDown(2);
        doc
          .fontSize(10)
          .font('Helvetica-Oblique')
          .text(
            `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
            { align: 'center' },
          );

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  async generateReportExcel(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<Buffer> {
    const report = await this.getCategoryReport(userId, startDate, endDate);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Expense Report');

    worksheet.columns = [
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Total Amount', key: 'total', width: 15 },
      { header: 'Count', key: 'count', width: 10 },
      { header: 'Percentage', key: 'percentage', width: 12 },
    ];

    worksheet.mergeCells('A1:D1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Expense Report by Category';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 30;

    worksheet.mergeCells('A2:D2');
    const dateCell = worksheet.getCell('A2');
    dateCell.value = `Report Period: ${startDate} to ${endDate}`;
    dateCell.font = { size: 12 };
    dateCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(2).height = 20;

    worksheet.mergeCells('A4:D4');
    const summaryCell = worksheet.getCell('A4');
    summaryCell.value = 'Summary';
    summaryCell.font = { size: 14, bold: true };
    summaryCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    worksheet.mergeCells('A5:B5');
    const totalLabelCell = worksheet.getCell('A5');
    totalLabelCell.value = 'Total Expenses:';
    totalLabelCell.font = { bold: true };

    worksheet.mergeCells('C5:D5');
    const totalValueCell = worksheet.getCell('C5');
    totalValueCell.value = report.totalAmount;
    totalValueCell.numFmt = '#,##0.00';
    totalValueCell.font = { bold: true };

    worksheet.mergeCells('A7:D7');
    const breakdownCell = worksheet.getCell('A7');
    breakdownCell.value = 'Category Breakdown';
    breakdownCell.font = { size: 14, bold: true };
    breakdownCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    const headerRow = worksheet.getRow(9);
    headerRow.values = ['Category', 'Total Amount', 'Count', 'Percentage'];
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.height = 20;
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

    let rowIndex = 10;
    report.categories.forEach((category) => {
      if (category.count > 0) {
        const row = worksheet.getRow(rowIndex);
        const percentage =
          report.totalAmount > 0
            ? (category.total / report.totalAmount) * 100
            : 0;

        row.values = [
          category.category,
          category.total,
          category.count,
          percentage / 100,
        ];

        row.getCell(2).numFmt = '#,##0.00';
        row.getCell(4).numFmt = '0.00%';

        if (rowIndex % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF2F2F2' },
          };
        }

        rowIndex++;
      }
    });

    const footerRowIndex = rowIndex + 2;
    worksheet.mergeCells(`A${footerRowIndex}:D${footerRowIndex}`);
    const footerCell = worksheet.getCell(`A${footerRowIndex}`);
    footerCell.value = `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;
    footerCell.font = { italic: true, size: 10 };
    footerCell.alignment = { horizontal: 'center' };

    for (let i = 9; i < rowIndex; i++) {
      const row = worksheet.getRow(i);
      for (let j = 1; j <= 4; j++) {
        row.getCell(j).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
