import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let mockProductRepository: any;
  let mockCategoryRepository: any;

  const mockProduct = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    oldPrice: 129.99,
    quantity: 10,
    image: 'test.jpg',
    categoryId: 1,
  };

  beforeEach(async () => {
    mockProductRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };

    mockCategoryRepository = {
      findOne: jest.fn(),
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
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      mockProductRepository.find.mockResolvedValue([mockProduct]);

      const result = await service.findAll();

      expect(result).toEqual([mockProduct]);
      expect(mockProductRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne(1);

      expect(result).toEqual(mockProduct);
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
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
        description: 'New Description',
        price: 49.99,
        oldPrice: 69.99,
        quantity: 20,
        image: 'new.jpg',
        categoryId: 1,
      };

      mockProductRepository.create.mockReturnValue({ id: 2, ...createProductDto });
      mockProductRepository.save.mockResolvedValue({ id: 2, ...createProductDto });

      const result = await service.create(createProductDto as any);

      expect(result).toHaveProperty('id');
      expect(mockProductRepository.create).toHaveBeenCalledWith(createProductDto);
      expect(mockProductRepository.save).toHaveBeenCalled();
    });
  });

  describe('decreaseStock', () => {
    it('should decrease product stock', async () => {
      const updatedProduct = { ...mockProduct, quantity: 5 };
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockProductRepository.save.mockResolvedValue(updatedProduct);

      await service.decreaseStock(1, 5);

      expect(mockProductRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockProductRepository.save).toHaveBeenCalled();
    });

    it('should throw error if stock is insufficient', async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      await expect(service.decreaseStock(1, 20)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('checkStockAvailability', () => {
    it('should return true if stock is available', async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.checkStockAvailability(1, 5);

      expect(result).toBe(true);
    });

    it('should return false if stock is insufficient', async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.checkStockAvailability(1, 20);

      expect(result).toBe(false);
    });
  });


});
