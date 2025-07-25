import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { faker } from '@faker-js/faker';

import { UserService } from './user.service';
import { User } from './entities/user.entity';

vi.mock('bcryptjs', () => ({
  hash: vi.fn().mockResolvedValue('hashedPassword' as any),
  compare: vi.fn().mockResolvedValue(true as any),
}));

import * as bcrypt from 'bcryptjs';

describe('UserService', () => {
  let service: UserService;
  let userModel: any;

  const mockUserModel = {
    create: vi.fn(),
    findOne: vi.fn(),
    findByPk: vi.fn(),
    findAndCountAll: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get(getModelToken(User));

    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      expect.assertions(4);

      const createUserDto = {
        email: faker.internet.email(),
        password: faker.internet.password({ length: 12 }),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };
      const hashedPassword = 'hashedPassword';
      const createdUser = {
        id: faker.number.int({ min: 1, max: 1000 }),
        ...createUserDto,
        password: hashedPassword,
        isActive: true,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      } as User;

      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue(createdUser);
      (bcrypt.hash as any).mockResolvedValue(hashedPassword);

      const result = await service.create(createUserDto);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(mockUserModel.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: hashedPassword,
      });
      expect(result).toEqual(createdUser);
    });

    it('should throw ConflictException when user already exists', async () => {
      expect.assertions(2);

      const createUserDto = {
        email: faker.internet.email(),
        password: faker.internet.password({ length: 12 }),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };
      const existingUser = {
        id: faker.number.int({ min: 1, max: 1000 }),
        email: createUserDto.email,
        password: 'hashedPassword',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        isActive: true,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      } as User;

      mockUserModel.findOne.mockResolvedValue(existingUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated users with default parameters', async () => {
      expect.assertions(3);

      const users = [
        {
          id: 1,
          email: faker.internet.email(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          isActive: true,
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        },
        {
          id: 2,
          email: faker.internet.email(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          isActive: true,
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        },
      ] as User[];
      const total = 2;

      mockUserModel.findAndCountAll.mockResolvedValue({
        count: total,
        rows: users,
      });

      const result = await service.findAll();

      expect(mockUserModel.findAndCountAll).toHaveBeenCalledWith({
        offset: 0,
        limit: 10,
        order: [['createdAt', 'DESC']],
      });
      expect(result.users).toEqual(users);
      expect(result.total).toBe(total);
    });

    it('should return paginated users with custom parameters', async () => {
      expect.assertions(3);

      const page = 2;
      const limit = 5;
      const users = [
        {
          id: 1,
          email: faker.internet.email(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          isActive: true,
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        },
      ] as User[];
      const total = 1;

      mockUserModel.findAndCountAll.mockResolvedValue({
        count: total,
        rows: users,
      });

      const result = await service.findAll(page, limit);

      expect(mockUserModel.findAndCountAll).toHaveBeenCalledWith({
        offset: 5,
        limit: 5,
        order: [['createdAt', 'DESC']],
      });
      expect(result.users).toEqual(users);
      expect(result.total).toBe(total);
    });
  });

  describe('findOne', () => {
    it('should return user when found', async () => {
      expect.assertions(2);

      const userId = 1;
      const user = {
        id: userId,
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        isActive: true,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      } as User;

      mockUserModel.findByPk.mockResolvedValue(user);

      const result = await service.findOne(userId);

      expect(mockUserModel.findByPk).toHaveBeenCalledWith(userId, {
        include: [expect.any(Function)],
      });
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException when user not found', async () => {
      expect.assertions(2);

      const userId = 999;

      mockUserModel.findByPk.mockResolvedValue(null);

      await expect(service.findOne(userId)).rejects.toThrow(NotFoundException);
      expect(mockUserModel.findByPk).toHaveBeenCalledWith(userId, {
        include: [expect.any(Function)],
      });
    });
  });

  describe('findByEmail', () => {
    it('should return user when found with default raw=false', async () => {
      expect.assertions(2);

      const email = 'test@example.com';
      const user = {
        id: 1,
        email,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        isActive: true,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      } as User;

      mockUserModel.findOne.mockResolvedValue(user);

      const result = await service.findByEmail(email);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { email },
        raw: false,
      });
      expect(result).toEqual(user);
    });

    it('should return user when found with raw=true', async () => {
      expect.assertions(2);

      const email = 'test@example.com';
      const user = {
        id: 1,
        email,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        isActive: true,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      } as User;

      mockUserModel.findOne.mockResolvedValue(user);

      const result = await service.findByEmail(email, true);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { email },
        raw: true,
      });
      expect(result).toEqual(user);
    });

    it('should return null when user not found', async () => {
      expect.assertions(2);

      const email = 'nonexistent@example.com';

      mockUserModel.findOne.mockResolvedValue(null);

      const result = await service.findByEmail(email);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { email },
        raw: false,
      });
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      expect.assertions(4);

      const userId = 1;
      const updateUserDto = {
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };
      const existingUser = {
        id: userId,
        email: 'old@example.com',
        firstName: 'Old',
        lastName: 'Name',
        isActive: true,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        update: vi.fn().mockResolvedValue(undefined),
      } as any;

      mockUserModel.findByPk.mockResolvedValue(existingUser);
      mockUserModel.findOne.mockResolvedValue(null);

      const result = await service.update(userId, updateUserDto);

      expect(mockUserModel.findByPk).toHaveBeenCalledWith(userId, {
        include: [expect.any(Function)],
      });
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { email: updateUserDto.email },
      });
      expect(existingUser.update).toHaveBeenCalledWith(updateUserDto);
      expect(result).toEqual(existingUser);
    });

    it('should hash password when updating password', async () => {
      expect.assertions(3);

      const userId = 1;
      const newPassword = 'newPassword123';
      const hashedPassword = 'hashedNewPassword';
      const updateUserDto = {
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        password: newPassword,
      };
      const existingUser = {
        id: userId,
        email: 'old@example.com',
        firstName: 'Old',
        lastName: 'Name',
        isActive: true,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        update: vi.fn().mockResolvedValue(undefined),
      } as any;

      mockUserModel.findByPk.mockResolvedValue(existingUser);
      mockUserModel.findOne.mockResolvedValue(null);
      (bcrypt.hash as any).mockResolvedValue(hashedPassword);

      await service.update(userId, updateUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(existingUser.update).toHaveBeenCalledWith({
        ...updateUserDto,
        password: hashedPassword,
      });
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { email: updateUserDto.email },
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      expect.assertions(2);

      const userId = 1;
      const updateUserDto = {
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };
      const existingUser = {
        id: userId,
        email: 'old@example.com',
        firstName: 'Old',
        lastName: 'Name',
        isActive: true,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      } as User;
      const conflictUser = {
        id: 2,
        email: updateUserDto.email,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        isActive: true,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      } as User;

      mockUserModel.findByPk.mockResolvedValue(existingUser);
      mockUserModel.findOne.mockResolvedValue(conflictUser);

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { email: updateUserDto.email },
      });
    });
  });

  describe('remove', () => {
    it('should remove user successfully', async () => {
      expect.assertions(2);

      const userId = 1;
      const existingUser = {
        id: userId,
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        isActive: true,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        destroy: vi.fn().mockResolvedValue(undefined),
      } as any;

      mockUserModel.findByPk.mockResolvedValue(existingUser);

      await service.remove(userId);

      expect(mockUserModel.findByPk).toHaveBeenCalledWith(userId, {
        include: [expect.any(Function)],
      });
      expect(existingUser.destroy).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      expect.assertions(2);

      const userId = 999;

      mockUserModel.findByPk.mockResolvedValue(null);

      await expect(service.remove(userId)).rejects.toThrow(NotFoundException);
      expect(mockUserModel.findByPk).toHaveBeenCalledWith(userId, {
        include: [expect.any(Function)],
      });
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      expect.assertions(2);

      const plainPassword = 'password123';
      const hashedPassword = 'hashedPassword';

      (bcrypt.compare as any).mockResolvedValue(true);

      const result = await service.validatePassword(
        plainPassword,
        hashedPassword,
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        plainPassword,
        hashedPassword,
      );
      expect(result).toBe(true);
    });

    it('should return false for invalid password', async () => {
      expect.assertions(2);

      const plainPassword = 'wrongPassword';
      const hashedPassword = 'hashedPassword';

      (bcrypt.compare as any).mockResolvedValue(false);

      const result = await service.validatePassword(
        plainPassword,
        hashedPassword,
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        plainPassword,
        hashedPassword,
      );
      expect(result).toBe(false);
    });
  });
});
