import { Body, Controller, Get, Param, Post, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { IsInt, Min, IsArray, ValidateNested, ArrayMinSize, IsString, IsEmail, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class CheckoutItemDto {
  @IsInt()
  productId!: number;

  @IsInt()
  @Min(1)
  quantity!: number;
}

class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  @ArrayMinSize(1)
  items!: CheckoutItemDto[];

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  phone!: string;

  @IsString()
  address!: string;

  @IsString()
  city!: string;

  @IsString()
  postalCode!: string;

  @IsString()
  province!: string;

  @IsString()
  paymentMethod!: string;

  @IsOptional()
  @IsInt()
  userId?: number;
}

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Get('reports/sales')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async getSalesReport(
    @Query('type') type: 'daily' | 'monthly',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!type || (type !== 'daily' && type !== 'monthly')) {
      throw new BadRequestException('Query parameter "type" must be "daily" or "monthly"');
    }
    return this.ordersService.generateSalesReport(type, startDate, endDate);
  }

  @Post('checkout')
  async checkout(@Body() payload: CreateOrderDto) {
    return this.ordersService.checkout(payload);
  }
}
