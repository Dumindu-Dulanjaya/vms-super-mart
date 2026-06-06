import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '../entities/user.entity';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('UsersService', () => {
  let service: UsersService;
  let mockUserRepository: any;
  let mockJwtService: any;
  let mockEventEmitter: any;

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

    mockEventEmitter = {
      emit: jest.fn(),
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
          provide: EventEmitter2,
          useValue: mockEventEmitter,
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
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'user.registered',
        { email: createUserDto.email, firstName: createUserDto.firstName }
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
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['orders'] });
    });
  });

  describe('updateUserProfile', () => {
    it('should update user fields and return updated user info', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        firstName: 'Jane',
        phone: '9999999999',
      });

      const result = await service.updateUserProfile(1, {
        firstName: 'Jane',
        phone: '9999999999',
      });

      expect(result.firstName).toBe('Jane');
      expect(result.phone).toBe('9999999999');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('should change user password successfully when current password matches', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        password: 'newHashedPassword',
      });

      const result = await service.changePassword(1, {
        currentPassword: 'hashedPassword',
        newPassword: 'newPassword123',
      });

      expect(result.success).toBe(true);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw error when current password does not match', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword(1, {
          currentPassword: 'wrongPassword',
          newPassword: 'newPassword123',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
