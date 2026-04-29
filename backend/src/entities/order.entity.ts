import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryColumn({ length: 64 })
  id!: string; // we will assign ids like ord_<ts>

  @Column({ default: 'placed' })
  status!: string;

  @Column({ type: 'json', nullable: true })
  customer!: Record<string, any> | null;

  @Column({ length: 120 })
  paymentMethod!: string;

  @Column({ type: 'json', nullable: true })
  summary!: Record<string, any> | null;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
  items!: OrderItem[];

  @CreateDateColumn()
  createdAt!: Date;
}
