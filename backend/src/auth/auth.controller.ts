import { Body, Controller, Post } from '@nestjs/common';
import { IsEmail, IsString } from 'class-validator';
import { AuthService } from './auth.service';

class AdminLoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/login')
  adminLogin(@Body() adminLoginDto: AdminLoginDto) {
    console.log('AuthController.adminLogin body:', adminLoginDto);
    return this.authService.adminLogin(adminLoginDto.email, adminLoginDto.password);
  }
}
