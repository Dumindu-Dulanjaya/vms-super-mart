import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { FlashSale } from '../entities/flash-sale.entity';
import { FlashSaleProduct } from '../entities/flash-sale-product.entity';
import { Product } from '../entities/product.entity';
import { CreateFlashSaleDto } from './dtos/create-flash-sale.dto';
import { AddFlashSaleProductDto } from './dtos/add-flash-sale-product.dto';

@Injectable()
export class FlashSalesService {
  constructor(
    @InjectRepository(FlashSale)
    private readonly flashSaleRepository: Repository<FlashSale>,
    @InjectRepository(FlashSaleProduct)
    private readonly flashSaleProductRepository: Repository<FlashSaleProduct>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // Automatically update statuses based on time
  private async autoCheckSales() {
    const now = new Date();

    // 1. Mark past sales as expired
    await this.flashSaleRepository.createQueryBuilder()
      .update(FlashSale)
      .set({ status: 'expired', isActive: false })
      .where('endTime < :now AND status != "expired"', { now })
      .execute();

    // 2. Mark active scheduled sales as active if they are in their time bounds and set to active
    // We only want to auto-shift scheduled -> active if they are marked isActive
    const activeSales = await this.flashSaleRepository.find({
      where: {
        isActive: true,
        status: 'scheduled',
      }
    });

    for (const sale of activeSales) {
      if (new Date(sale.startTime) <= now && new Date(sale.endTime) >= now) {
        sale.status = 'active';
        await this.flashSaleRepository.save(sale);
      }
    }
  }

  // Deactivate all other active flash sales
  private async enforceMutualExclusion(activeSaleId: number) {
    await this.flashSaleRepository.createQueryBuilder()
      .update(FlashSale)
      .set({ isActive: false, status: 'scheduled' })
      .where('id != :activeSaleId AND (isActive = true OR status = "active")', { activeSaleId })
      .execute();
  }

  async create(createDto: CreateFlashSaleDto) {
    const start = new Date(createDto.startTime);
    const end = new Date(createDto.endTime);

    if (end <= start) {
      throw new BadRequestException('End time must be after start time');
    }

    const now = new Date();
    let status: 'active' | 'scheduled' | 'expired' = 'scheduled';
    if (end < now) {
      status = 'expired';
    } else if (start <= now && now <= end && createDto.isActive) {
      status = 'active';
    }

    const flashSale = this.flashSaleRepository.create({
      title: createDto.title,
      description: createDto.description || null,
      startTime: start,
      endTime: end,
      status,
      isActive: createDto.isActive ?? false,
    });

    const saved = await this.flashSaleRepository.save(flashSale);

    if (saved.isActive) {
      await this.enforceMutualExclusion(saved.id);
    }

    return saved;
  }

  async findAll() {
    await this.autoCheckSales();
    return this.flashSaleRepository.find({
      relations: ['flashSaleProducts', 'flashSaleProducts.product'],
      order: { startTime: 'DESC' },
    });
  }

  async findOne(id: number) {
    await this.autoCheckSales();
    const flashSale = await this.flashSaleRepository.findOne({
      where: { id },
      relations: ['flashSaleProducts', 'flashSaleProducts.product'],
    });
    if (!flashSale) {
      throw new NotFoundException(`Flash Sale with ID ${id} not found`);
    }
    return flashSale;
  }

  async update(id: number, updateDto: Partial<CreateFlashSaleDto>) {
    const flashSale = await this.flashSaleRepository.findOne({ where: { id } });
    if (!flashSale) {
      throw new NotFoundException(`Flash Sale with ID ${id} not found`);
    }

    const start = updateDto.startTime ? new Date(updateDto.startTime) : flashSale.startTime;
    const end = updateDto.endTime ? new Date(updateDto.endTime) : flashSale.endTime;

    if (end <= start) {
      throw new BadRequestException('End time must be after start time');
    }

    if (updateDto.title !== undefined) flashSale.title = updateDto.title;
    if (updateDto.description !== undefined) flashSale.description = updateDto.description;
    flashSale.startTime = start;
    flashSale.endTime = end;

    if (updateDto.isActive !== undefined) {
      flashSale.isActive = updateDto.isActive;
    }

    // Recompute status
    const now = new Date();
    if (end < now) {
      flashSale.status = 'expired';
      flashSale.isActive = false;
    } else if (start <= now && now <= end && flashSale.isActive) {
      flashSale.status = 'active';
    } else {
      flashSale.status = 'scheduled';
    }

    const saved = await this.flashSaleRepository.save(flashSale);

    if (saved.isActive) {
      await this.enforceMutualExclusion(saved.id);
    }

    return saved;
  }

  async addProduct(flashSaleId: number, addDto: AddFlashSaleProductDto) {
    const flashSale = await this.flashSaleRepository.findOne({ where: { id: flashSaleId } });
    if (!flashSale) {
      throw new NotFoundException(`Flash Sale with ID ${flashSaleId} not found`);
    }

    if (flashSale.status === 'expired') {
      throw new BadRequestException('Cannot add products to an expired Flash Sale');
    }

    const product = await this.productRepository.findOne({ where: { id: addDto.productId } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${addDto.productId} not found`);
    }

    if (product.stock <= 0) {
      throw new BadRequestException('Cannot add out of stock products to a Flash Sale');
    }

    if (Number(addDto.salePrice) >= Number(product.price)) {
      throw new BadRequestException('Sale price must be lower than original price');
    }

    // Check duplicate
    const existing = await this.flashSaleProductRepository.findOne({
      where: { flashSaleId, productId: addDto.productId },
    });
    if (existing) {
      throw new BadRequestException('Product is already in this Flash Sale');
    }

    const flashSaleProduct = this.flashSaleProductRepository.create({
      flashSaleId,
      productId: addDto.productId,
      discountPercentage: Number(addDto.discountPercentage),
      salePrice: Number(addDto.salePrice),
    });

    return this.flashSaleProductRepository.save(flashSaleProduct);
  }

  async removeProduct(flashSaleId: number, productId: number) {
    const link = await this.flashSaleProductRepository.findOne({
      where: { flashSaleId, productId },
    });
    if (!link) {
      throw new NotFoundException(`Product not found in this Flash Sale`);
    }
    await this.flashSaleProductRepository.remove(link);
    return { success: true };
  }

  async getActiveFlashSale() {
    await this.autoCheckSales();
    const activeSale = await this.flashSaleRepository.findOne({
      where: {
        isActive: true,
        status: 'active',
      },
      relations: ['flashSaleProducts', 'flashSaleProducts.product'],
    });

    return activeSale;
  }

  async remove(id: number) {
    const flashSale = await this.flashSaleRepository.findOne({ where: { id } });
    if (!flashSale) {
      throw new NotFoundException(`Flash Sale with ID ${id} not found`);
    }
    await this.flashSaleRepository.remove(flashSale);
    return { success: true };
  }
}
