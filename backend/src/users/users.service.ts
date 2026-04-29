import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { EmailService } from '../email/email.service';

export class CreateUserDto {
  firstName!: string;
  lastName!: string;
  email!: string;
  password!: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  province?: string;
}

export class UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  province?: string;
}

export class LoginUserDto {
  email!: string;
  password!: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
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

    // Send welcome email
    await this.emailService.sendWelcomeEmail(savedUser.email, savedUser.firstName);

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
    return userWithoutPassword;
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
    return userWithoutPassword;
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
}
