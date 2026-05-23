import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards, Put, Delete } from '@nestjs/common';
import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsInt, Min, Max } from 'class-validator';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ProductsService } from './products.service';

class CreateProductDto {
  @IsString()
  name!: string;

  @IsNumber()
  price!: number;

  @IsOptional()
  @IsNumber()
  oldPrice!: number;

  @IsString()
  category!: string;

  @IsOptional()
  @IsString()
  image!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[]; // Array of high-resolution gallery images

  @IsOptional()
  @IsNumber()
  rating!: number;

  @IsOptional()
  @IsNumber()
  reviews!: number;

  @IsOptional()
  @IsBoolean()
  instock!: boolean;

  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsNumber()
  lowStockThreshold?: number;

  @IsOptional()
  @IsString()
  description!: string;
}

class UpdateStockDto {
  @IsNumber()
  quantity!: number;
}

class RateProductDto {
  @IsInt()
  @Min(1)
  @Max(5)
  score!: number;
}

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Get('category/:category')
  findByCategory(@Param('category') category: string) {
    return this.productsService.findByCategory(category);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: Partial<CreateProductDto>) {
    return this.productsService.update(id, updateDto as any);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }

  // Inventory Management Endpoints
  @Get('inventory/low-stock')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  getLowStockProducts() {
    return this.productsService.getLowStockProducts();
  }

  @Put(':id/stock')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  updateStock(@Param('id', ParseIntPipe) id: number, @Body() updateStockDto: UpdateStockDto) {
    return this.productsService.updateStock(id, updateStockDto.quantity);
  }

  @Post(':id/stock/increase')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  increaseStock(@Param('id', ParseIntPipe) id: number, @Body() updateStockDto: UpdateStockDto) {
    return this.productsService.increaseStock(id, updateStockDto.quantity);
  }

  @Post(':id/stock/decrease')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  decreaseStock(@Param('id', ParseIntPipe) id: number, @Body() updateStockDto: UpdateStockDto) {
    return this.productsService.decreaseStock(id, updateStockDto.quantity);
  }

  @Post(':id/rate')
  rateProduct(@Param('id', ParseIntPipe) id: number, @Body() rateDto: RateProductDto) {
    return this.productsService.rate(id, rateDto.score);
  }
}
