import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { InventoryBatch } from '../entities/inventory-batch.entity';
import { FlashSale } from '../entities/flash-sale.entity';
import { FlashSaleProduct } from '../entities/flash-sale-product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, InventoryBatch, FlashSale, FlashSaleProduct])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
