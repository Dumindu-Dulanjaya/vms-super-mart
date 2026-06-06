import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { EventsGateway } from '../events/events.gateway';

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
  userId?: number;
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly eventsGateway: EventsGateway,
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
      userId: payload.userId || null,
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

    // Notify administrators via WebSockets
    this.eventsGateway.emitNewOrder(saved);

    // Deduct stock for each item after order is created
    for (const item of payload.items) {
      await this.productsService.decreaseStock(item.productId, item.quantity);
    }

    // Send order confirmation email (asynchronously in background)
    this.eventEmitter.emit('order.placed', {
      orderId: saved.id,
      customerName: `${payload.firstName} ${payload.lastName}`,
      customerEmail: payload.email,
      items: lineItems,
      subtotal: saved.summary?.subtotal || 0,
      discount: saved.summary?.discount || 0,
      shipping: saved.summary?.shipping || 0,
      total: saved.summary?.total || 0,
      address: payload.address,
      city: payload.city,
      province: payload.province,
      postalCode: payload.postalCode,
    });

    return saved;
  }

  async generateSalesReport(type: 'daily' | 'monthly', startDate?: string, endDate?: string) {
    const query = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .orderBy('order.createdAt', 'ASC');

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      query.andWhere('order.createdAt >= :startDate', { startDate: start });
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.andWhere('order.createdAt <= :endDate', { endDate: end });
    }

    const orders = await query.getMany();

    // Group and aggregate in memory to support complex JSON column parsing
    const groups: { [key: string]: {
      period: string;
      ordersCount: number;
      grossSales: number;
      discounts: number;
      netSales: number;
      itemsCount: number;
    }} = {};

    for (const order of orders) {
      // Group key based on type
      const date = new Date(order.createdAt);
      let key = '';
      if (type === 'daily') {
        key = date.toISOString().split('T')[0];
      } else {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        key = `${year}-${month}`;
      }

      const orderTotal = Number(order.summary?.total || 0);
      const orderDiscount = Number(order.summary?.discount || 0);
      const orderSubtotal = Number(order.summary?.subtotal || 0);
      const orderShipping = Number(order.summary?.shipping || 0);
      const orderItemsCount = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

      if (!groups[key]) {
        groups[key] = {
          period: key,
          ordersCount: 0,
          grossSales: 0,
          discounts: 0,
          netSales: 0,
          itemsCount: 0,
        };
      }

      const group = groups[key];
      group.ordersCount += 1;
      group.grossSales += (orderSubtotal + orderShipping);
      group.discounts += orderDiscount;
      group.netSales += orderTotal;
      group.itemsCount += orderItemsCount;
    }

    const reportData = Object.values(groups).map(g => ({
      ...g,
      averageOrderValue: g.ordersCount > 0 ? Math.round((g.netSales / g.ordersCount) * 100) / 100 : 0,
      grossSales: Math.round(g.grossSales * 100) / 100,
      discounts: Math.round(g.discounts * 100) / 100,
      netSales: Math.round(g.netSales * 100) / 100,
    })).sort((a, b) => a.period.localeCompare(b.period));

    return reportData;
  }

  async findDeliveryOrders() {
    return this.orderRepository.find({
      where: [
        { status: 'ready' },
        { status: 'shipped' },
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: string, status: string) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    order.status = status;
    const updated = await this.orderRepository.save(order);

    // Notify clients via WebSockets
    this.eventsGateway.emitOrderStatusUpdate({ orderId: id, status });

    return updated;
  }
}
