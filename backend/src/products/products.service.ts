import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { InventoryBatch } from '../entities/inventory-batch.entity';

type ProductResponse = {
  id: number;
  name: string;
  price: number;
  oldPrice: number;
  category: string;
  image: string;
  images?: string[];
  slug: string;
  rating: number;
  reviews: number;
  instock: boolean;
  description: string | null;
  stock: number;
  lowStockThreshold: number;
};

type CreateProductInput = {
  name: string;
  price: number;
  oldPrice: number;
  category: string;
  image: string;
  images?: string[];
  rating: number;
  reviews: number;
  instock: boolean;
  description: string;
  slug?: string;
  stock?: number;
  lowStockThreshold?: number;
};

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(InventoryBatch)
    private readonly batchRepository: Repository<InventoryBatch>,
  ) {}

  private toResponse(product: Product): ProductResponse {
    return {
      id: product.id,
      name: product.name,
      price: Number(product.price),
      oldPrice: Number(product.oldPrice),
      category: product.category?.slug ?? '',
      image: product.image,
      images: product.images,
      slug: product.slug,
      rating: product.rating,
      reviews: product.reviews,
      instock: product.instock,
      description: product.description,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
    };
  }

  async findAll() {
    const products = await this.productRepository.find({
      relations: ['category'],
      order: { id: 'ASC' },
    });
    return products.map((product) => this.toResponse(product));
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return this.toResponse(product);
  }

  async findBySlug(slug: string) {
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    return this.toResponse(product);
  }

  async findByCategory(category: string) {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('LOWER(category.slug) = LOWER(:category)', { category })
      .orderBy('product.id', 'ASC')
      .getMany();

    return products.map((product) => this.toResponse(product));
  }

  async create(productInput: CreateProductInput) {
    const slug =
      productInput.slug ||
      productInput.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

    const categorySlug = (productInput.category || 'misc').toLowerCase();
    let category = await this.categoryRepository.findOne({
      where: { slug: categorySlug },
    });

    if (!category) {
      category = this.categoryRepository.create({
        slug: categorySlug,
        label: productInput.category,
      });
      category = await this.categoryRepository.save(category);
    }

    const stockVal = productInput.stock !== undefined ? Number(productInput.stock) : 0;
    const lowStockVal = productInput.lowStockThreshold !== undefined ? Number(productInput.lowStockThreshold) : 5;

    const product = this.productRepository.create({
      name: productInput.name,
      slug,
      price: productInput.price,
      oldPrice: productInput.oldPrice,
      image: productInput.image,
      images: productInput.images || [],
      rating: productInput.rating,
      reviews: productInput.reviews,
      instock: stockVal > 0,
      stock: stockVal,
      lowStockThreshold: lowStockVal,
      description: productInput.description,
      category,
    });

    const saved = await this.productRepository.save(product);
    if (stockVal > 0) {
      const initialBatch = this.batchRepository.create({
        batchNumber: `BATCH-INIT-${Date.now()}`,
        initialQuantity: stockVal,
        quantity: stockVal,
        purchasePrice: Number(productInput.price) * 0.7,
        receivedAt: new Date(),
        product: saved,
      });
      await this.batchRepository.save(initialBatch);
    }
    return this.toResponse(saved);
  }

  async update(id: number, updateInput: Partial<CreateProductInput>) {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['category'] });
    if (!product) throw new NotFoundException(`Product with id ${id} not found`);

    if (updateInput.name) product.name = updateInput.name;
    if (updateInput.price !== undefined) product.price = updateInput.price as any;
    if (updateInput.oldPrice !== undefined) product.oldPrice = updateInput.oldPrice as any;
    if (updateInput.image !== undefined) product.image = updateInput.image;
    if (updateInput.images !== undefined) product.images = updateInput.images;
    if (updateInput.description !== undefined) product.description = updateInput.description;
    if (updateInput.category) {
      const categorySlug = updateInput.category.toLowerCase();
      let category = await this.categoryRepository.findOne({ where: { slug: categorySlug } });
      if (!category) {
        category = this.categoryRepository.create({ slug: categorySlug, label: updateInput.category });
        category = await this.categoryRepository.save(category);
      }
      product.category = category;
    }

    if (updateInput.stock !== undefined) {
      await this.syncStockBatches(id, Number(updateInput.stock), Number(product.price));
      const batches = await this.batchRepository.find({ where: { productId: id } });
      product.stock = batches.reduce((sum, b) => sum + Math.max(0, b.quantity), 0);
      product.instock = product.stock > 0;
    }
    if (updateInput.lowStockThreshold !== undefined) {
      product.lowStockThreshold = Number(updateInput.lowStockThreshold);
    }

    const saved = await this.productRepository.save(product);
    return this.toResponse(saved);
  }

  async remove(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product with id ${id} not found`);
    await this.productRepository.remove(product);
    return { success: true };
  }

  // Helper to recalculate total stock from active batches
  async recalculateProductStock(productId: number) {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) return;

    const batches = await this.batchRepository.find({ where: { productId } });
    const totalStock = batches.reduce((sum, b) => sum + Math.max(0, b.quantity), 0);

    product.stock = totalStock;
    product.instock = totalStock > 0;
    await this.productRepository.save(product);
  }

  // Helper to sync stock adjustments with batches
  private async syncStockBatches(productId: number, targetStock: number, price: number) {
    const batches = await this.batchRepository.find({ where: { productId } });
    const currentStock = batches.reduce((sum, b) => sum + Math.max(0, b.quantity), 0);

    if (targetStock > currentStock) {
      const initialBatch = this.batchRepository.create({
        batchNumber: `BATCH-ADJ-${Date.now()}`,
        initialQuantity: targetStock - currentStock,
        quantity: targetStock - currentStock,
        purchasePrice: price * 0.7,
        receivedAt: new Date(),
        productId,
      });
      await this.batchRepository.save(initialBatch);
    } else if (targetStock < currentStock) {
      let remainingToDeduct = currentStock - targetStock;
      const activeBatches = batches.filter(b => b.quantity > 0).sort((a, b) => new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime());
      
      for (const batch of activeBatches) {
        if (remainingToDeduct <= 0) break;
        if (batch.quantity >= remainingToDeduct) {
          batch.quantity -= remainingToDeduct;
          remainingToDeduct = 0;
          await this.batchRepository.save(batch);
        } else {
          remainingToDeduct -= batch.quantity;
          batch.quantity = 0;
          await this.batchRepository.save(batch);
        }
      }
    }
  }

  // Inventory Batch Operations
  async getBatches(productId: number) {
    return this.batchRepository.find({
      where: { productId },
      order: { receivedAt: 'ASC' },
    });
  }

  async addBatch(productId: number, batchData: { batchNumber?: string; quantity: number; purchasePrice: number; receivedAt?: Date | string; expiryDate?: Date | string | null; newPrice?: number }) {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException(`Product with id ${productId} not found`);

    if (batchData.newPrice !== undefined && batchData.newPrice !== null && Number(batchData.newPrice) > 0) {
      product.oldPrice = product.price;
      product.price = Number(batchData.newPrice);
      await this.productRepository.save(product);
    }

    const batch = this.batchRepository.create({
      batchNumber: batchData.batchNumber || `BATCH-${Date.now()}`,
      initialQuantity: Number(batchData.quantity),
      quantity: Number(batchData.quantity),
      purchasePrice: Number(batchData.purchasePrice) || 0,
      receivedAt: batchData.receivedAt ? new Date(batchData.receivedAt) : new Date(),
      expiryDate: batchData.expiryDate ? new Date(batchData.expiryDate) : null,
      product,
    });

    await this.batchRepository.save(batch);
    await this.recalculateProductStock(productId);
    return batch;
  }

  async deleteBatch(batchId: number) {
    const batch = await this.batchRepository.findOne({ where: { id: batchId } });
    if (!batch) throw new NotFoundException(`Batch with id ${batchId} not found`);

    const productId = batch.productId;
    await this.batchRepository.remove(batch);
    await this.recalculateProductStock(productId);
    return { success: true };
  }

  // Inventory Management Methods
  async updateStock(id: number, quantity: number) {
    await this.syncStockBatches(id, quantity, 0);
    await this.recalculateProductStock(id);
    const product = await this.productRepository.findOne({ where: { id }, relations: ['category'] });
    return this.toResponse(product!);
  }

  async decreaseStock(id: number, quantity: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product with id ${id} not found`);

    const batches = await this.batchRepository.find({
      where: { productId: id },
      order: { receivedAt: 'ASC' }, // FIFO - oldest first
    });

    const activeBatches = batches.filter(b => b.quantity > 0);
    const totalAvailable = activeBatches.reduce((sum, b) => sum + b.quantity, 0);

    if (totalAvailable < quantity) {
      throw new BadRequestException(`Insufficient stock for product ${product.name}. Available: ${totalAvailable}, Requested: ${quantity}`);
    }

    let remainingToDeduct = quantity;
    for (const batch of activeBatches) {
      if (remainingToDeduct <= 0) break;

      if (batch.quantity >= remainingToDeduct) {
        batch.quantity -= remainingToDeduct;
        remainingToDeduct = 0;
        await this.batchRepository.save(batch);
      } else {
        remainingToDeduct -= batch.quantity;
        batch.quantity = 0;
        await this.batchRepository.save(batch);
      }
    }

    await this.recalculateProductStock(id);
    const updated = await this.productRepository.findOne({ where: { id }, relations: ['category'] });
    return this.toResponse(updated!);
  }

  async increaseStock(id: number, quantity: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product with id ${id} not found`);
    
    await this.addBatch(id, {
      quantity,
      purchasePrice: Number(product.price) * 0.7,
    });
    const updated = await this.productRepository.findOne({ where: { id }, relations: ['category'] });
    return this.toResponse(updated!);
  }

  async checkStockAvailability(id: number, quantity: number): Promise<boolean> {
    const batches = await this.batchRepository.find({ where: { productId: id } });
    const totalAvailable = batches.reduce((sum, b) => sum + Math.max(0, b.quantity), 0);
    return totalAvailable >= quantity;
  }

  async getLowStockProducts() {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.stock <= product.lowStockThreshold')
      .orderBy('product.stock', 'ASC')
      .getMany();

    return products.map((product) => ({
      ...this.toResponse(product),
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
    }));
  }

  async rate(id: number, score: number) {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['category'] });
    if (!product) throw new NotFoundException(`Product with id ${id} not found`);

    if (score < 1 || score > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const currentRating = product.rating || 0;
    const currentReviews = product.reviews || 0;
    const newReviews = currentReviews + 1;
    
    // Calculate new average rating, rounded to nearest integer
    const newRating = Math.round(((currentRating * currentReviews) + score) / newReviews);

    product.reviews = newReviews;
    product.rating = newRating;

    const saved = await this.productRepository.save(product);
    return this.toResponse(saved);
  }
}
