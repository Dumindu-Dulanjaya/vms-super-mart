import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';

type CheckoutItem = {
  productId: number;
  quantity: number;
};

type CheckoutPayload = {
  items: CheckoutItem[];
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  province: string;
  paymentMethod: string;
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async findAll() {
    const orders = await this.orderRepository.find({ order: { createdAt: 'DESC' } });
    return orders;
  }

  async findOne(id: string) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  async checkout(payload: CheckoutPayload) {
    if (!payload.items || payload.items.length === 0) {
      throw new BadRequestException('Checkout requires at least one item');
    }

    // First, check stock availability for all items
    for (const item of payload.items) {
      const hasStock = await this.productsService.checkStockAvailability(item.productId, item.quantity);
      if (!hasStock) {
        const product = await this.productsService.findOne(item.productId);
        throw new BadRequestException(`Insufficient stock for ${product.name}`);
      }
    }

    const lineItems = await Promise.all(
      payload.items.map(async (item) => {
        const product = await this.productsService.findOne(item.productId);
        return {
          productId: product.id,
          name: product.name,
          quantity: item.quantity,
          price: product.price,
          total: product.price * item.quantity,
        };
      }),
    );

    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const discount = (
      await Promise.all(
        payload.items.map(async (item) => {
          const product = await this.productsService.findOne(item.productId);
          return (product.oldPrice - product.price) * item.quantity;
        }),
      )
    ).reduce((sum, amount) => sum + amount, 0);

    const orderId = `ord_${Date.now()}`;

    const order = this.orderRepository.create({
      id: orderId,
      status: 'placed',
      customer: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        phone: payload.phone,
        address: payload.address,
        city: payload.city,
        postalCode: payload.postalCode,
        province: payload.province,
      },
      paymentMethod: payload.paymentMethod,
      summary: {
        subtotal,
        discount,
        shipping: 0,
        total: subtotal,
      },
      items: lineItems.map((li) =>
        this.orderItemRepository.create({
          productId: li.productId,
          name: li.name,
          quantity: li.quantity,
          price: li.price,
          total: li.total,
        }),
      ),
    });

    const saved = await this.orderRepository.save(order);

    // Deduct stock for each item after order is created
    for (const item of payload.items) {
      await this.productsService.decreaseStock(item.productId, item.quantity);
    }

    return saved;
  }
}
