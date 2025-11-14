import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseService } from './expense.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Expense } from './expense.model';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { FilterExpenseDto } from './dto/filter-expense.dto';
import { ExpenseCategory } from './expense-category.enum';

describe('ExpenseService', () => {
  let service: ExpenseService;
  let expenseRepository: jest.Mocked<Repository<Expense>>;

  const mockExpense = {
    id: '1',
    userId: 'user-1',
    title: 'Test expense',
    amount: 100.5,
    category: ExpenseCategory.FOOD,
    notes: 'Test notes',
    expenseDate: new Date('2024-01-15'),
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {} as any,
  } as unknown as Expense;

  const mockExpenses = [
    mockExpense,
    {
      id: '2',
      userId: 'user-1',
      title: 'Transport expense',
      amount: 50.25,
      category: ExpenseCategory.TRANSPORTATION,
      notes: 'Transport notes',
      expenseDate: new Date('2024-01-16'),
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {} as any,
    } as unknown as Expense,
  ];

  beforeEach(async () => {
    const mockExpenseRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpenseService,
        {
          provide: getRepositoryToken(Expense),
          useValue: mockExpenseRepository,
        },
      ],
    }).compile();

    service = module.get<ExpenseService>(ExpenseService);
    expenseRepository = module.get(getRepositoryToken(Expense));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createExpenseDto: CreateExpenseDto = {
      title: 'Test expense',
      amount: 100.5,
      category: ExpenseCategory.FOOD,
      notes: 'Test notes',
      expenseDate: '2024-01-15',
    };

    it('should successfully create an expense', async () => {
      expenseRepository.create.mockReturnValue(mockExpense);
      expenseRepository.save.mockResolvedValue(mockExpense);

      const result = await service.create('user-1', createExpenseDto);

      expect(expenseRepository.create).toHaveBeenCalledWith({
        ...createExpenseDto,
        userId: 'user-1',
      });
      expect(expenseRepository.save).toHaveBeenCalledWith(mockExpense);
      expect(result).toEqual(mockExpense);
    });
  });

  describe('findAll', () => {
    const filterDto: FilterExpenseDto = {
      page: 1,
      limit: 10,
    };

    it('should return paginated expenses', async () => {
      expenseRepository.findAndCount.mockResolvedValue([mockExpenses, 2]);

      const result = await service.findAll('user-1', filterDto);

      expect(expenseRepository.findAndCount).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        order: { expenseDate: 'DESC' },
        take: 10,
        skip: 0,
      });
      expect(result).toEqual({
        data: mockExpenses,
        total: 2,
        page: 1,
        limit: 10,
      });
    });

    it('should filter by category', async () => {
      const filterWithCategory: FilterExpenseDto = {
        page: 1,
        limit: 10,
        category: ExpenseCategory.FOOD,
      };
      expenseRepository.findAndCount.mockResolvedValue([[mockExpense], 1]);

      await service.findAll('user-1', filterWithCategory);

      expect(expenseRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: 'user-1',
            category: ExpenseCategory.FOOD,
          },
        }),
      );
    });

    it('should filter by date range', async () => {
      const filterWithDates: FilterExpenseDto = {
        page: 1,
        limit: 10,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };
      expenseRepository.findAndCount.mockResolvedValue([mockExpenses, 2]);

      await service.findAll('user-1', filterWithDates);

      expect(expenseRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-1',
          }),
        }),
      );
    });

    it('should handle pagination correctly', async () => {
      const filterWithPage: FilterExpenseDto = {
        page: 2,
        limit: 5,
      };
      expenseRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll('user-1', filterWithPage);

      expect(expenseRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
          skip: 5, // (page 2 - 1) * limit 5
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return an expense when found and user matches', async () => {
      expenseRepository.findOne.mockResolvedValue(mockExpense);

      const result = await service.findOne('1', 'user-1');

      expect(expenseRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockExpense);
    });

    it('should throw NotFoundException when expense not found', async () => {
      expenseRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('999', 'user-1')).rejects.toThrow(
        'Expense with ID 999 not found',
      );
    });

    it('should throw ForbiddenException when user does not own the expense', async () => {
      expenseRepository.findOne.mockResolvedValue(mockExpense);

      await expect(service.findOne('1', 'different-user')).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.findOne('1', 'different-user')).rejects.toThrow(
        'You do not have permission to access this expense',
      );
    });
  });

  describe('update', () => {
    const updateExpenseDto: UpdateExpenseDto = {
      amount: 150.75,
      notes: 'Updated notes',
    };

    it('should successfully update an expense', async () => {
      const updatedExpense = {
        ...mockExpense,
        ...updateExpenseDto,
        user: {} as any,
      } as unknown as Expense;
      expenseRepository.findOne.mockResolvedValue(mockExpense);
      expenseRepository.save.mockResolvedValue(updatedExpense);

      const result = await service.update('1', 'user-1', updateExpenseDto);

      expect(expenseRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(expenseRepository.save).toHaveBeenCalled();
      expect(result.amount).toEqual(updateExpenseDto.amount);
      expect(result.notes).toEqual(updateExpenseDto.notes);
    });

    it('should throw NotFoundException if expense not found', async () => {
      expenseRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('999', 'user-1', updateExpenseDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own expense', async () => {
      expenseRepository.findOne.mockResolvedValue(mockExpense);

      await expect(
        service.update('1', 'different-user', updateExpenseDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should successfully remove an expense', async () => {
      expenseRepository.findOne.mockResolvedValue(mockExpense);
      expenseRepository.remove.mockResolvedValue(mockExpense);

      await service.remove('1', 'user-1');

      expect(expenseRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(expenseRepository.remove).toHaveBeenCalledWith(mockExpense);
    });

    it('should throw NotFoundException if expense not found', async () => {
      expenseRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('999', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(expenseRepository.remove).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user does not own expense', async () => {
      expenseRepository.findOne.mockResolvedValue(mockExpense);

      await expect(service.remove('1', 'different-user')).rejects.toThrow(
        ForbiddenException,
      );
      expect(expenseRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('getCategoryReport', () => {
    it('should generate a category report with correct totals', async () => {
      const reportExpenses = [
        {
          id: '1',
          userId: 'user-1',
          amount: 100,
          category: ExpenseCategory.FOOD,
          expenseDate: new Date('2024-01-15'),
        },
        {
          id: '2',
          userId: 'user-1',
          amount: 50,
          category: ExpenseCategory.FOOD,
          expenseDate: new Date('2024-01-16'),
        },
        {
          id: '3',
          userId: 'user-1',
          amount: 75,
          category: ExpenseCategory.TRANSPORTATION,
          expenseDate: new Date('2024-01-17'),
        },
      ] as Expense[];

      expenseRepository.find.mockResolvedValue(reportExpenses);

      const result = await service.getCategoryReport(
        'user-1',
        '2024-01-01',
        '2024-01-31',
      );

      expect(result.startDate).toBe('2024-01-01');
      expect(result.endDate).toBe('2024-01-31');
      expect(result.totalAmount).toBe(225);
      expect(result.categories).toHaveLength(Object.keys(ExpenseCategory).length);

      const foodCategory = result.categories.find(
        (c) => c.category === ExpenseCategory.FOOD,
      );
      expect(foodCategory?.total).toBe(150);
      expect(foodCategory?.count).toBe(2);

      const transportCategory = result.categories.find(
        (c) => c.category === ExpenseCategory.TRANSPORTATION,
      );
      expect(transportCategory?.total).toBe(75);
      expect(transportCategory?.count).toBe(1);
    });

    it('should handle empty expense list', async () => {
      expenseRepository.find.mockResolvedValue([]);

      const result = await service.getCategoryReport(
        'user-1',
        '2024-01-01',
        '2024-01-31',
      );

      expect(result.totalAmount).toBe(0);
      expect(result.categories.every((c) => c.total === 0 && c.count === 0)).toBe(
        true,
      );
    });
  });

  describe('generateReportPdf', () => {
    it('should generate a PDF report', async () => {
      const mockReport = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        totalAmount: 225,
        categories: [
          {
            category: ExpenseCategory.FOOD,
            total: 150,
            count: 2,
          },
          {
            category: ExpenseCategory.TRANSPORTATION,
            total: 75,
            count: 1,
          },
        ],
      };

      expenseRepository.find.mockResolvedValue([]);
      jest.spyOn(service, 'getCategoryReport').mockResolvedValue(mockReport);

      const result = await service.generateReportPdf(
        'user-1',
        '2024-01-01',
        '2024-01-31',
      );

      expect(result).toBeDefined();
      expect(typeof result.read).toBe('function');
    });
  });

  describe('generateReportExcel', () => {
    it('should generate an Excel report', async () => {
      const mockReport = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        totalAmount: 225,
        categories: [
          {
            category: ExpenseCategory.FOOD,
            total: 150,
            count: 2,
          },
          {
            category: ExpenseCategory.TRANSPORTATION,
            total: 75,
            count: 1,
          },
        ],
      };

      expenseRepository.find.mockResolvedValue([]);
      jest.spyOn(service, 'getCategoryReport').mockResolvedValue(mockReport);

      const result = await service.generateReportExcel(
        'user-1',
        '2024-01-01',
        '2024-01-31',
      );

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
