import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { FlashSalesService } from './flash-sales.service';
import { CreateFlashSaleDto } from './dtos/create-flash-sale.dto';
import { AddFlashSaleProductDto } from './dtos/add-flash-sale-product.dto';

@Controller('flash-sales')
export class FlashSalesController {
  constructor(private readonly flashSalesService: FlashSalesService) {}

  @Get('active')
  getActiveFlashSale() {
    return this.flashSalesService.getActiveFlashSale();
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  create(@Body() createDto: CreateFlashSaleDto) {
    return this.flashSalesService.create(createDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  findAll() {
    return this.flashSalesService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.flashSalesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: Partial<CreateFlashSaleDto>,
  ) {
    return this.flashSalesService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.flashSalesService.remove(id);
  }

  @Post(':id/products')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  addProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() addDto: AddFlashSaleProductDto,
  ) {
    return this.flashSalesService.addProduct(id, addDto);
  }

  @Delete(':id/products/:productId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  removeProduct(
    @Param('id', ParseIntPipe) id: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.flashSalesService.removeProduct(id, productId);
  }
}
