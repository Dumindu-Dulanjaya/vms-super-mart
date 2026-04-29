import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { User } from './user.entity';

@Entity('orders')
export class Order {
  @PrimaryColumn({ length: 64 })
  id!: string; // we will assign ids like ord_<ts>

  @Column({ default: 'placed' })
  status!: string;

  @Column({ nullable: true })
  userId!: number | null;

  @ManyToOne(() => User, (user) => user.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'userId' })
  user!: User | null;

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
