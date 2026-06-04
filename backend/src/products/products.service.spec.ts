import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { InventoryBatch } from '../entities/inventory-batch.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let mockProductRepository: any;
  let mockCategoryRepository: any;
  let mockBatchRepository: any;

  const mockCategory = {
    id: 1,
    slug: 'misc',
    label: 'Misc',
  };

  const mockProduct = {
    id: 1,
    name: 'Test Product',
    slug: 'test-product',
    description: 'Test Description',
    price: 99.99,
    oldPrice: 129.99,
    stock: 10,
    lowStockThreshold: 5,
    instock: true,
    image: 'test.jpg',
    images: [],
    rating: 5,
    reviews: 1,
    category: mockCategory,
  };

  const mockBatch = {
    id: 1,
    batchNumber: 'BATCH-1',
    initialQuantity: 10,
    quantity: 10,
    purchasePrice: 70.0,
    sellingPrice: 99.99,
    receivedAt: new Date(),
    expiryDate: null,
    productId: 1,
  };

  beforeEach(async () => {
    mockProductRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      remove: jest.fn(),
    };

    mockCategoryRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockBatchRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
        {
          provide: getRepositoryToken(InventoryBatch),
          useValue: mockBatchRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of products mapped to response', async () => {
      mockProductRepository.find.mockResolvedValue([mockProduct]);

      const result = await service.findAll();

      expect(result).toEqual([
        {
          id: 1,
          name: 'Test Product',
          price: 99.99,
          oldPrice: 129.99,
          category: 'misc',
          image: 'test.jpg',
          images: [],
          slug: 'test-product',
          rating: 5,
          reviews: 1,
          instock: true,
          description: 'Test Description',
          stock: 10,
          lowStockThreshold: 5,
          batches: [],
        },
      ]);
      expect(mockProductRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single product mapped to response', async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne(1);

      expect(result).toEqual({
        id: 1,
        name: 'Test Product',
        price: 99.99,
        oldPrice: 129.99,
        category: 'misc',
        image: 'test.jpg',
        images: [],
        slug: 'test-product',
        rating: 5,
        reviews: 1,
        instock: true,
        description: 'Test Description',
        stock: 10,
        lowStockThreshold: 5,
        batches: [],
      });
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['category', 'batches'],
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a new product', async () => {
      const createProductDto = {
        name: 'New Product',
        price: 49.99,
        oldPrice: 69.99,
        category: 'misc',
        image: 'new.jpg',
        images: [],
        rating: 0,
        reviews: 0,
        instock: true,
        description: 'New Description',
        stock: 20,
        lowStockThreshold: 5,
      };

      const expectedSavedProduct = {
        id: 2,
        name: 'New Product',
        slug: 'new-product',
        price: 49.99,
        oldPrice: 69.99,
        category: mockCategory,
        image: 'new.jpg',
        images: [],
        rating: 0,
        reviews: 0,
        instock: true,
        stock: 20,
        lowStockThreshold: 5,
        description: 'New Description',
      };

      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockProductRepository.create.mockReturnValue(expectedSavedProduct);
      mockProductRepository.save.mockResolvedValue(expectedSavedProduct);
      mockBatchRepository.create.mockReturnValue(mockBatch);
      mockBatchRepository.save.mockResolvedValue(mockBatch);

      const result = await service.create(createProductDto as any);

      expect(result).toEqual({
        id: 2,
        name: 'New Product',
        slug: 'new-product',
        price: 49.99,
        oldPrice: 69.99,
        category: 'misc',
        image: 'new.jpg',
        images: [],
        rating: 0,
        reviews: 0,
        instock: true,
        stock: 20,
        lowStockThreshold: 5,
        description: 'New Description',
        batches: [],
      });
      expect(mockProductRepository.create).toHaveBeenCalled();
      expect(mockProductRepository.save).toHaveBeenCalled();
      expect(mockBatchRepository.create).toHaveBeenCalled();
      expect(mockBatchRepository.save).toHaveBeenCalled();
    });
  });

  describe('decreaseStock', () => {
    it('should decrease stock based on FIFO batches', async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockBatchRepository.find.mockResolvedValue([
        { ...mockBatch, quantity: 10, receivedAt: new Date('2026-01-01') },
        { ...mockBatch, id: 2, batchNumber: 'BATCH-2', quantity: 5, receivedAt: new Date('2026-02-01') },
      ]);
      mockBatchRepository.save.mockResolvedValue({});
      mockProductRepository.save.mockResolvedValue({ ...mockProduct, stock: 9 });

      const result = await service.decreaseStock(1, 6);

      expect(mockBatchRepository.save).toHaveBeenCalled();
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw error if stock is insufficient', async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockBatchRepository.find.mockResolvedValue([mockBatch]); // stock = 10

      await expect(service.decreaseStock(1, 20)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('checkStockAvailability', () => {
    it('should return true if stock is available', async () => {
      mockBatchRepository.find.mockResolvedValue([mockBatch]); // stock = 10

      const result = await service.checkStockAvailability(1, 5);

      expect(result).toBe(true);
    });

    it('should return false if stock is insufficient', async () => {
      mockBatchRepository.find.mockResolvedValue([mockBatch]); // stock = 10

      const result = await service.checkStockAvailability(1, 20);

      expect(result).toBe(false);
    });
  });
});
