import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { EmailService } from '../email/email.service';
import { User } from '../entities/user.entity';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('UsersService', () => {
  let service: UsersService;
  let mockUserRepository: any;
  let mockJwtService: any;
  let mockEmailService: any;

  const mockUser = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'hashedPassword',
    phone: '1234567890',
    address: '123 Street',
    city: 'City',
    postalCode: '12345',
    province: 'Province',
    role: 'user',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('jwt_token'),
    };

    mockEmailService = {
      sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerUser', () => {
    it('should register a new user and send welcome email', async () => {
      const createUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockUserRepository.create.mockReturnValue({
        ...createUserDto,
        password: 'hashedPassword',
      });
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.registerUser(createUserDto);

      expect(result).toHaveProperty('accessToken');
      expect(result.email).toBe(createUserDto.email);
      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(
        createUserDto.email,
        createUserDto.firstName,
      );
      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      const createUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.registerUser(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('loginUser', () => {
    it('should login user and return token', async () => {
      const loginDto = {
        email: 'john@example.com',
        password: 'Password123',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.loginUser(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result.email).toBe(loginDto.email);
      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it('should throw error for invalid credentials', async () => {
      const loginDto = {
        email: 'john@example.com',
        password: 'WrongPassword',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.loginUser(loginDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if user not found', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'Password123',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.loginUser(loginDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserById(1);

      expect(result).toBeDefined();
      expect(result.firstName).toBe(mockUser.firstName);
      expect(result.email).toBe(mockUser.email);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
