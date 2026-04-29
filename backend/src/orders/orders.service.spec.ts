import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { ProductsService } from '../products/products.service';
import { EmailService } from '../email/email.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('OrdersService', () => {
  let service: OrdersService;
  let mockOrderRepository: any;
  let mockOrderItemRepository: any;
  let mockProductsService: any;
  let mockEmailService: any;

  const mockOrder = {
    id: 'ord_123456',
    status: 'placed',
    customer: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      address: '123 Street',
      city: 'City',
      postalCode: '12345',
      province: 'Province',
    },
    paymentMethod: 'card',
    summary: {
      subtotal: 100,
      discount: 10,
      shipping: 5,
      total: 95,
    },
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockOrderRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };

    mockOrderItemRepository = {
      create: jest.fn(),
    };

    mockProductsService = {
      findOne: jest.fn(),
      checkStockAvailability: jest.fn().mockResolvedValue(true),
      decreaseStock: jest.fn().mockResolvedValue(undefined),
    };

    mockEmailService = {
      sendOrderConfirmation: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: mockOrderItemRepository,
        },
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of orders', async () => {
      mockOrderRepository.find.mockResolvedValue([mockOrder]);

      const result = await service.findAll();

      expect(result).toEqual([mockOrder]);
      expect(mockOrderRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single order', async () => {
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.findOne('ord_123456');

      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException if order not found', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid_id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('checkout', () => {
    it('should create order and send confirmation email', async () => {
      const checkoutPayload = {
        items: [{ productId: 1, quantity: 2 }],
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        address: '123 Street',
        city: 'City',
        postalCode: '12345',
        province: 'Province',
        paymentMethod: 'card',
      };

      const mockProduct = {
        id: 1,
        name: 'Product',
        price: 50,
        oldPrice: 70,
      };

      mockProductsService.findOne.mockResolvedValue(mockProduct);
      mockOrderRepository.create.mockReturnValue(mockOrder);
      mockOrderRepository.save.mockResolvedValue(mockOrder);

      const result = await service.checkout(checkoutPayload);

      expect(result).toBeDefined();
      expect(mockProductsService.checkStockAvailability).toHaveBeenCalled();
      expect(mockEmailService.sendOrderConfirmation).toHaveBeenCalled();
      expect(mockProductsService.decreaseStock).toHaveBeenCalled();
    });

    it('should throw error if no items in checkout', async () => {
      const checkoutPayload = {
        items: [],
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        address: '123 Street',
        city: 'City',
        postalCode: '12345',
        province: 'Province',
        paymentMethod: 'card',
      };

      await expect(service.checkout(checkoutPayload)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if stock is insufficient', async () => {
      const checkoutPayload = {
        items: [{ productId: 1, quantity: 100 }],
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        address: '123 Street',
        city: 'City',
        postalCode: '12345',
        province: 'Province',
        paymentMethod: 'card',
      };

      mockProductsService.checkStockAvailability.mockResolvedValue(false);
      const mockProduct = { id: 1, name: 'Product' };
      mockProductsService.findOne.mockResolvedValue(mockProduct);

      await expect(service.checkout(checkoutPayload)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
