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
  ): Promise<Expense[]> {
    const { startDate, endDate, category } = filterDto;
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

    return await this.expenseRepository.find({
      where,
      order: { expenseDate: 'DESC' },
    });
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
}
