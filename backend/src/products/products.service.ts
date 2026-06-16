import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { InventoryBatch } from '../entities/inventory-batch.entity';
import { FlashSale } from '../entities/flash-sale.entity';
import { FlashSaleProduct } from '../entities/flash-sale-product.entity';

type ProductBatchInfo = {
  id: number;
  batchNumber: string;
  quantity: number;
  sellingPrice: number;
  regularPrice: number;
  receivedAt: Date | string;
};

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
  batches?: ProductBatchInfo[];
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
    @InjectRepository(FlashSale)
    private readonly flashSaleRepository: Repository<FlashSale>,
    @InjectRepository(FlashSaleProduct)
    private readonly flashSaleProductRepository: Repository<FlashSaleProduct>,
  ) {}

  private toResponse(product: Product): ProductResponse {
    const activeBatches = product.batches
      ? product.batches
          .filter((b) => b.quantity > 0)
          .sort((a, b) => {
            const timeA = new Date(a.receivedAt).getTime();
            const timeB = new Date(b.receivedAt).getTime();
            if (timeA !== timeB) return timeA - timeB;
            return a.id - b.id;
          })
          .map((b) => ({
            id: b.id,
            batchNumber: b.batchNumber,
            quantity: b.quantity,
            sellingPrice: Number(b.sellingPrice),
            regularPrice: Number(b.regularPrice),
            receivedAt: b.receivedAt,
          }))
      : [];

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
      batches: activeBatches,
    };
  }

  private async getActiveFlashSaleInfo(): Promise<FlashSale | null> {
    const now = new Date();
    
    // Auto check/update expired active flash sales
    await this.flashSaleRepository.createQueryBuilder()
      .update(FlashSale)
      .set({ status: 'expired', isActive: false })
      .where("endTime < :now AND status != 'expired'", { now })
      .execute();

    const activeSale = await this.flashSaleRepository.findOne({
      where: {
        isActive: true,
        status: 'active',
      },
      relations: ['flashSaleProducts'],
    });

    if (!activeSale) return null;

    if (new Date(activeSale.endTime) < now) {
      activeSale.status = 'expired';
      activeSale.isActive = false;
      await this.flashSaleRepository.save(activeSale);
      return null;
    }

    if (new Date(activeSale.startTime) > now) {
      return null;
    }

    return activeSale;
  }

  private applyFlashSaleOverrides(productResp: ProductResponse, activeSale: FlashSale | null): ProductResponse {
    if (!activeSale || !activeSale.flashSaleProducts) return productResp;

    const flashProduct = activeSale.flashSaleProducts.find(
      (fp) => fp.productId === productResp.id,
    );

    if (flashProduct) {
      return {
        ...productResp,
        oldPrice: Number(productResp.price),
        price: Number(flashProduct.salePrice),
      };
    }

    return productResp;
  }

  async findAll(admin = false) {
    const products = await this.productRepository.find({
      relations: ['category', 'batches'],
      order: { id: 'ASC' },
    });
    const responses = products.map((product) => this.toResponse(product));
    if (admin) return responses;

    const activeSale = await this.getActiveFlashSaleInfo();
    return responses.map(res => this.applyFlashSaleOverrides(res, activeSale));
  }

  async findPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    sort?: string;
    admin?: boolean;
  }) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const query = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.batches', 'batches');

    if (options.search) {
      query.andWhere(
        '(product.name LIKE :search OR product.description LIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    if (options.category) {
      query.andWhere('category.name = :category', { category: options.category });
    }

    if (options.sort) {
      switch (options.sort) {
        case 'price_low':
          query.orderBy('product.price', 'ASC');
          break;
        case 'price_high':
          query.orderBy('product.price', 'DESC');
          break;
        case 'rating':
          query.orderBy('product.rating', 'DESC');
          break;
        case 'name':
          query.orderBy('product.name', 'ASC');
          break;
        default:
          query.orderBy('product.id', 'ASC');
      }
    } else {
      query.orderBy('product.id', 'ASC');
    }

    query.skip(skip).take(limit);

    const [products, total] = await query.getManyAndCount();
    const responses = products.map((product) => this.toResponse(product));

    if (options.admin) {
      return {
        data: responses,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

    const activeSale = await this.getActiveFlashSaleInfo();
    const overridden = responses.map(res => this.applyFlashSaleOverrides(res, activeSale));

    return {
      data: overridden,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, admin = false) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'batches'],
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    const response = this.toResponse(product);
    if (admin) return response;

    const activeSale = await this.getActiveFlashSaleInfo();
    return this.applyFlashSaleOverrides(response, activeSale);
  }

  async findBySlug(slug: string, admin = false) {
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: ['category', 'batches'],
    });

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    const response = this.toResponse(product);
    if (admin) return response;

    const activeSale = await this.getActiveFlashSaleInfo();
    return this.applyFlashSaleOverrides(response, activeSale);
  }

  async findByCategory(category: string, admin = false) {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.batches', 'batches')
      .where('LOWER(category.slug) = LOWER(:category)', { category })
      .orderBy('product.id', 'ASC')
      .getMany();

    const responses = products.map((product) => this.toResponse(product));
    if (admin) return responses;

    const activeSale = await this.getActiveFlashSaleInfo();
    return responses.map(res => this.applyFlashSaleOverrides(res, activeSale));
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
        sellingPrice: Number(productInput.price),
        regularPrice: Number(productInput.oldPrice) || Number(productInput.price),
        receivedAt: new Date(new Date().setHours(0, 0, 0, 0)),
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

    // FIFO active batch selling price matching
    const activeBatches = batches
      .filter((b) => b.quantity > 0)
      .sort((a, b) => {
        const timeA = new Date(a.receivedAt).getTime();
        const timeB = new Date(b.receivedAt).getTime();
        if (timeA !== timeB) return timeA - timeB;
        return a.id - b.id;
      });

    if (activeBatches.length > 0) {
      const oldestActive = activeBatches[0];
      if (Number(oldestActive.sellingPrice) > 0) {
        product.price = Number(oldestActive.sellingPrice);
        product.oldPrice = Number(oldestActive.regularPrice) || 0;
      }
    }

    await this.productRepository.save(product);
  }

  // Helper to sync stock adjustments with batches
  private async syncStockBatches(productId: number, targetStock: number, price: number) {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    const batches = await this.batchRepository.find({ where: { productId } });
    const currentStock = batches.reduce((sum, b) => sum + Math.max(0, b.quantity), 0);

    if (targetStock > currentStock) {
      const regularPriceVal = product ? (Number(product.oldPrice) || Number(product.price)) : price;
      const initialBatch = this.batchRepository.create({
        batchNumber: `BATCH-ADJ-${Date.now()}`,
        initialQuantity: targetStock - currentStock,
        quantity: targetStock - currentStock,
        purchasePrice: price * 0.7,
        sellingPrice: price,
        regularPrice: regularPriceVal,
        receivedAt: new Date(new Date().setHours(0, 0, 0, 0)),
        productId,
      });
      await this.batchRepository.save(initialBatch);
    } else if (targetStock < currentStock) {
      let remainingToDeduct = currentStock - targetStock;
      const activeBatches = batches
        .filter((b) => b.quantity > 0)
        .sort((a, b) => {
          const timeA = new Date(a.receivedAt).getTime();
          const timeB = new Date(b.receivedAt).getTime();
          if (timeA !== timeB) return timeA - timeB;
          return a.id - b.id;
        });
      
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
      order: { receivedAt: 'ASC', id: 'ASC' },
    });
  }

  async addBatch(productId: number, batchData: { batchNumber?: string; quantity: number; purchasePrice: number; receivedAt?: Date | string; expiryDate?: Date | string | null; sellingPrice?: number; regularPrice?: number }) {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException(`Product with id ${productId} not found`);

    const sellingPriceVal = batchData.sellingPrice !== undefined && Number(batchData.sellingPrice) > 0
      ? Number(batchData.sellingPrice)
      : Number(product.price);

    const regularPriceVal = batchData.regularPrice !== undefined && Number(batchData.regularPrice) > 0
      ? Number(batchData.regularPrice)
      : (Number(product.oldPrice) || sellingPriceVal);

    const batch = this.batchRepository.create({
      batchNumber: batchData.batchNumber || `BATCH-${Date.now()}`,
      initialQuantity: Number(batchData.quantity),
      quantity: Number(batchData.quantity),
      purchasePrice: Number(batchData.purchasePrice) || 0,
      sellingPrice: sellingPriceVal,
      regularPrice: regularPriceVal,
      receivedAt: batchData.receivedAt 
        ? new Date(new Date(batchData.receivedAt).setHours(0, 0, 0, 0)) 
        : new Date(new Date().setHours(0, 0, 0, 0)),
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
      order: { receivedAt: 'ASC', id: 'ASC' }, // FIFO - oldest first
    });

    const activeBatches = batches.filter(b => b.quantity > 0);
    const totalAvailable = activeBatches.reduce((sum, b) => sum + b.quantity, 0);

    if (totalAvailable < quantity) {
      throw new BadRequestException(`Insufficient stock for product ${product.name}. Available: ${totalAvailable}, Requested: ${quantity}`);
    }

    if (activeBatches.length > 0) {
      const oldestBatch = activeBatches[0];
      if (quantity > oldestBatch.quantity) {
        throw new BadRequestException(`Cannot purchase more than the remaining quantity (${oldestBatch.quantity}) of the active batch. Please purchase up to ${oldestBatch.quantity} units.`);
      }
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
