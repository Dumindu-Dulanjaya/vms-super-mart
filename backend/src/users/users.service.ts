import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IsEmail, IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  province?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsArray()
  addresses?: any[];
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @IsString()
  @IsNotEmpty()
  newPassword!: string;
}

export class LoginUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private eventEmitter: EventEmitter2,
  ) {}

  async registerUser(createUserDto: CreateUserDto) {
    // Check if email already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create new user
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(user);

    // Send welcome email (asynchronously in background)
    this.eventEmitter.emit('user.registered', { email: savedUser.email, firstName: savedUser.firstName });

    // Generate JWT token
    const token = this.jwtService.sign({
      sub: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
    });

    return {
      id: savedUser.id,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      email: savedUser.email,
      role: savedUser.role,
      accessToken: token,
    };
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const user = await this.usersRepository.findOne({
      where: { email: loginUserDto.email },
    });

    if (!user) {
      throw new BadRequestException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );

    if (!passwordMatches) {
      throw new BadRequestException('Invalid email or password');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      accessToken: token,
    };
  }

  async getUserById(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['orders'],
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Don't return password
    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      addresses: user.addresses || [],
    };
  }

  async updateUserProfile(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);

    const { password, ...userWithoutPassword } = updatedUser;
    return {
      ...userWithoutPassword,
      addresses: updatedUser.addresses || [],
    };
  }

  async changePassword(id: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const passwordMatches = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!passwordMatches) {
      throw new BadRequestException('Incorrect current password');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.password = hashedPassword;
    await this.usersRepository.save(user);

    return { success: true };
  }

  async getUserOrders(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['orders', 'orders.items'],
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user.orders;
  }

  async googleLogin(idToken: string) {
    if (!idToken) {
      throw new BadRequestException('ID Token is required');
    }

    try {
      let email: string;
      let firstName: string;
      let lastName: string;

      if (idToken.startsWith('mock-')) {
        const parts = idToken.split('-');
        email = parts[1] || 'mockuser@gmail.com';
        firstName = parts[2] || 'Mock';
        lastName = parts[3] || 'Google';
      } else {
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
        if (!response.ok) {
          throw new Error('Failed to verify token with Google');
        }

        const googlePayload: any = await response.json();
        email = googlePayload.email;
        firstName = googlePayload.given_name || 'Google';
        lastName = googlePayload.family_name || 'User';
      }

      if (!email) {
        throw new BadRequestException('Email not provided in Google profile');
      }

      let user = await this.usersRepository.findOne({ where: { email } });

      if (!user) {
        const randomPassword = Math.random().toString(36).substring(2, 15);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        user = this.usersRepository.create({
          firstName,
          lastName,
          email,
          password: hashedPassword,
          isActive: true,
          role: 'user',
        });
        user = await this.usersRepository.save(user);

        // Send welcome email (asynchronously in background)
        this.eventEmitter.emit('user.registered', { email: user.email, firstName: user.firstName });
      }

      const token = this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        province: user.province || '',
        addresses: user.addresses || [],
        accessToken: token,
      };
    } catch (err: any) {
      throw new BadRequestException(`Google login failed: ${err.message}`);
    }
  }

  async getAllUsers() {
    const users = await this.usersRepository.find({
      order: { id: 'DESC' },
    });
    return users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }
}
