import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async adminLogin(email: string, password: string) {
    try {
      if (typeof password !== 'string' || password.length === 0) {
        throw new BadRequestException('Password is required');
      }
      const admin = await this.userRepository.findOne({ where: { email } });
      if (!admin) throw new UnauthorizedException('Invalid credentials');

      if (admin.role !== 'admin' && admin.role !== 'rider') {
        throw new UnauthorizedException('Access denied. Insufficient role permissions.');
      }

      if (!admin.password || typeof admin.password !== 'string') {
        console.error('User record missing password for', email);
        throw new UnauthorizedException('Invalid credentials');
      }

      const match = await bcrypt.compare(password, admin.password);
      if (!match) throw new UnauthorizedException('Invalid credentials');

      const payload = { sub: admin.id, email: admin.email, role: admin.role };
      let accessToken = 'admin-demo-token';
      try {
        if (this.jwtService && typeof this.jwtService.sign === 'function') {
          accessToken = this.jwtService.sign(payload);
        }
      } catch (e) {
        // fallback to demo token
        console.error('JWT sign error, falling back to demo token', e);
      }

      return {
        accessToken,
        user: {
          id: admin.id,
          name: `${admin.firstName} ${admin.lastName}`,
          email: admin.email,
          role: admin.role,
        },
      };
    } catch (err) {
      console.error('Auth login error:', err);
      if (err instanceof UnauthorizedException) throw err;
      throw err;
    }
  }
}
