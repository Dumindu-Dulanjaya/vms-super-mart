import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import {
  UsersService,
  CreateUserDto,
  LoginUserDto,
  UpdateUserDto,
} from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  async registerUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.registerUser(createUserDto);
  }

  @Post('login')
  async loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.usersService.loginUser(loginUserDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getUserProfile(@Request() req: any) {
    return this.usersService.getUserById(req.user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserById(id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateUserProfile(@Request() req: any, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUserProfile(req.user.userId, updateUserDto);
  }

  @Get(':id/orders')
  @UseGuards(JwtAuthGuard)
  async getUserOrders(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserOrders(id);
  }

  @Post('google-login')
  async googleLogin(@Body('idToken') idToken: string) {
    return this.usersService.googleLogin(idToken);
  }
}
