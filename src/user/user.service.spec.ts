import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.model';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    hashPassword: jest.fn(),
    validatePassword: jest.fn(),
  } as unknown as User;

  const mockUsers = [
    mockUser,
    {
      id: '2',
      email: 'test2@example.com',
      name: 'Test User 2',
      password: 'hashedPassword',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      hashPassword: jest.fn(),
      validatePassword: jest.fn(),
    } as unknown as User,
  ];

  beforeEach(async () => {
    const mockUserRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUsers', () => {
    it('should return an array of active users', async () => {
      userRepository.find.mockResolvedValue(mockUsers);

      const result = await service.getUsers();

      expect(userRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array when no users exist', async () => {
      userRepository.find.mockResolvedValue([]);

      const result = await service.getUsers();

      expect(result).toEqual([]);
    });
  });

  describe('getUserById', () => {
    it('should return a user when found', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserById('1');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', isActive: true },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.getUserById('999')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getUserById('999')).rejects.toThrow('User not found');
    });
  });

  describe('createUser', () => {
    const createUserDto: CreateUserDto = {
      email: 'new@example.com',
      password: 'password123',
      name: 'New User',
    };

    it('should successfully create a new user', async () => {
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      const result = await service.createUser(createUserDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(userRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException if email already exists', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.createUser(createUserDto)).rejects.toThrow(
        'User email already exists',
      );
      expect(userRepository.create).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    const updateUserDto: UpdateUserDto = {
      name: 'Updated Name',
    };

    it('should successfully update a user', async () => {
      const updatedUser = {
        ...mockUser,
        ...updateUserDto,
        hashPassword: jest.fn(),
        validatePassword: jest.fn(),
      } as unknown as User;
      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateUser('1', updateUserDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', isActive: true },
      });
      expect(userRepository.save).toHaveBeenCalled();
      expect(result.name).toEqual(updateUserDto.name);
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.updateUser('999', updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update user with new email if available', async () => {
      const updateWithEmail: UpdateUserDto = {
        email: 'newemail@example.com',
        name: 'Updated Name',
      };
      const updatedUser = {
        ...mockUser,
        ...updateWithEmail,
        hashPassword: jest.fn(),
        validatePassword: jest.fn(),
      } as unknown as User;
      userRepository.findOne.mockResolvedValueOnce(mockUser);
      userRepository.findOne.mockResolvedValueOnce(null);
      userRepository.save.mockResolvedValue(updatedUser);

      await service.updateUser('1', updateWithEmail);

      expect(userRepository.findOne).toHaveBeenCalledTimes(2);
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if new email already exists', async () => {
      const updateWithEmail: UpdateUserDto = {
        email: 'existing@example.com',
      };
      const existingUser = {
        ...mockUser,
        id: '2',
        email: 'existing@example.com',
        hashPassword: jest.fn(),
        validatePassword: jest.fn(),
      } as unknown as User;

      userRepository.findOne.mockResolvedValueOnce(mockUser);
      userRepository.findOne.mockResolvedValueOnce(existingUser);

      await expect(service.updateUser('1', updateWithEmail)).rejects.toThrow(
        ConflictException,
      );
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should not check email uniqueness if email is not being changed', async () => {
      const updateWithSameEmail: UpdateUserDto = {
        email: mockUser.email,
        name: 'Updated Name',
      };
      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      await service.updateUser('1', updateWithSameEmail);

      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteUser', () => {
    it('should successfully delete a user', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.remove.mockResolvedValue(mockUser);

      await service.deleteUser('1');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', isActive: true },
      });
      expect(userRepository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteUser('999')).rejects.toThrow(
        NotFoundException,
      );
      expect(userRepository.remove).not.toHaveBeenCalled();
    });
  });
});
