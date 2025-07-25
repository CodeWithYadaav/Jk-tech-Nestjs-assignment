import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { faker } from '@faker-js/faker';

import { AuthService } from '../../../src/modules/auth/auth.service';
import { UserService } from '../../../src/modules/user/user.service';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserService: any;
  let mockJwtService: any;

  beforeEach(async () => {
    mockUserService = {
      findByEmail: vi.fn(),
      create: vi.fn(),
      validatePassword: vi.fn(),
    };

    mockJwtService = {
      sign: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    (service as any).userService = mockUserService;
    (service as any).jwtService = mockJwtService;

    vi.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      expect.assertions(3);
      const email = faker.internet.email();
      const password = faker.internet.password({ length: 12 });
      const user = {
        id: faker.number.int({ min: 1, max: 1000 }),
        email,
        password: 'hashedPassword',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        isActive: true,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      };

      mockUserService.findByEmail.mockResolvedValue(user);
      mockUserService.validatePassword.mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockUserService.validatePassword).toHaveBeenCalledWith(
        password,
        user.password,
      );
      expect(result).toEqual(user);
    });

    it('should return null when user is not found', async () => {
      expect.assertions(2);
      const email = faker.internet.email();
      const password = faker.internet.password({ length: 12 });

      mockUserService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(email, password);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      expect.assertions(3);
      const email = faker.internet.email();
      const password = faker.internet.password({ length: 12 });
      const user = {
        id: faker.number.int({ min: 1, max: 1000 }),
        email,
        password: 'hashedPassword',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        isActive: true,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      };

      mockUserService.findByEmail.mockResolvedValue(user);
      mockUserService.validatePassword.mockResolvedValue(false);

      const result = await service.validateUser(email, password);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockUserService.validatePassword).toHaveBeenCalledWith(
        password,
        user.password,
      );
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return auth response when credentials are valid', async () => {
      expect.assertions(5);
      const loginDto = {
        email: faker.internet.email(),
        password: faker.internet.password({ length: 12 }),
      };
      const user = {
        id: faker.number.int({ min: 1, max: 1000 }),
        email: loginDto.email,
        password: 'hashedPassword',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        isActive: true,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      };
      const accessToken = faker.string.alphanumeric(64);

      vi.spyOn(service, 'validateUser').mockResolvedValue(user as any);
      mockJwtService.sign.mockReturnValue(accessToken);

      const result = await service.login(loginDto);

      expect(service.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
      });
      expect(result.accessToken).toBe(accessToken);
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).toEqual(
        expect.objectContaining({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
        }),
      );
    });

    it('should exclude password from user response', async () => {
      expect.assertions(2);
      const loginDto = {
        email: faker.internet.email(),
        password: faker.internet.password({ length: 12 }),
      };
      const user = {
        id: faker.number.int({ min: 1, max: 1000 }),
        email: loginDto.email,
        password: 'hashedPassword',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        isActive: true,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      };
      const accessToken = faker.string.alphanumeric(64);

      vi.spyOn(service, 'validateUser').mockResolvedValue(user as any);
      mockJwtService.sign.mockReturnValue(accessToken);

      const result = await service.login(loginDto);

      expect(result.user).not.toHaveProperty('password');
      expect(result.user).toEqual(
        expect.not.objectContaining({
          password: expect.any(String),
        }),
      );
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      expect.assertions(2);
      const loginDto = {
        email: faker.internet.email(),
        password: faker.internet.password({ length: 12 }),
      };

      vi.spyOn(service, 'validateUser').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(service.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
    });
  });

  describe('register', () => {
    it('should create user and return auth response', async () => {
      expect.assertions(5);
      const registerDto = {
        email: faker.internet.email(),
        password: faker.internet.password({ length: 12 }),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };
      const createdUser = {
        id: faker.number.int({ min: 1, max: 1000 }),
        email: registerDto.email,
        password: 'hashedPassword',
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        isActive: true,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      };
      const accessToken = faker.string.alphanumeric(64);

      const mockUserInstance = {
        ...createdUser,
        toJSON: vi.fn().mockReturnValue(createdUser),
      };

      mockUserService.create.mockResolvedValue(mockUserInstance);
      mockJwtService.sign.mockReturnValue(accessToken);

      const result = await service.register(registerDto);

      expect(mockUserService.create).toHaveBeenCalledWith(registerDto);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: createdUser.id,
        email: createdUser.email,
      });
      expect(result.accessToken).toBe(accessToken);
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).toEqual(
        expect.objectContaining({
          id: createdUser.id,
          email: createdUser.email,
          firstName: createdUser.firstName,
          lastName: createdUser.lastName,
        }),
      );
    });

    it('should exclude password from user response', async () => {
      expect.assertions(2);
      const registerDto = {
        email: faker.internet.email(),
        password: faker.internet.password({ length: 12 }),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };
      const createdUser = {
        id: faker.number.int({ min: 1, max: 1000 }),
        email: registerDto.email,
        password: 'hashedPassword',
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        isActive: true,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      };
      const accessToken = faker.string.alphanumeric(64);

      const mockUserInstance = {
        ...createdUser,
        toJSON: vi.fn().mockReturnValue(createdUser),
      };

      mockUserService.create.mockResolvedValue(mockUserInstance);
      mockJwtService.sign.mockReturnValue(accessToken);

      const result = await service.register(registerDto);

      expect(result.user).not.toHaveProperty('password');
      expect(result.user).toEqual(
        expect.not.objectContaining({
          password: expect.any(String),
        }),
      );
    });

    it('should handle user creation errors', async () => {
      expect.assertions(2);
      const registerDto = {
        email: faker.internet.email(),
        password: faker.internet.password({ length: 12 }),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };
      const error = new Error('User creation failed');

      mockUserService.create.mockRejectedValue(error);

      await expect(service.register(registerDto)).rejects.toThrow(error);
      expect(mockUserService.create).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete login flow', async () => {
      expect.assertions(6);
      const loginDto = {
        email: faker.internet.email(),
        password: faker.internet.password({ length: 12 }),
      };
      const user = {
        id: faker.number.int({ min: 1, max: 1000 }),
        email: loginDto.email,
        password: 'hashedPassword',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        isActive: true,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      };
      const accessToken = faker.string.alphanumeric(64);

      mockUserService.findByEmail.mockResolvedValue(user);
      mockUserService.validatePassword.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(accessToken);

      const result = await service.login(loginDto);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockUserService.validatePassword).toHaveBeenCalledWith(
        loginDto.password,
        user.password,
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
      });
      expect(result.accessToken).toBe(accessToken);
      expect(result.user).toEqual(
        expect.objectContaining({
          id: user.id,
          email: user.email,
        }),
      );
      expect(result.user).not.toHaveProperty('password');
    });

    it('should handle complete registration flow', async () => {
      expect.assertions(4);
      const registerDto = {
        email: faker.internet.email(),
        password: faker.internet.password({ length: 12 }),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };
      const createdUser = {
        id: faker.number.int({ min: 1, max: 1000 }),
        email: registerDto.email,
        password: 'hashedPassword',
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        isActive: true,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      };
      const accessToken = faker.string.alphanumeric(64);

      const mockUserInstance = {
        ...createdUser,
        toJSON: vi.fn().mockReturnValue(createdUser),
      };

      mockUserService.create.mockResolvedValue(mockUserInstance);
      mockJwtService.sign.mockReturnValue(accessToken);

      const result = await service.register(registerDto);

      expect(mockUserService.create).toHaveBeenCalledWith(registerDto);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: createdUser.id,
        email: createdUser.email,
      });
      expect(result.accessToken).toBe(accessToken);
      expect(result.user).not.toHaveProperty('password');
    });
  });
});
