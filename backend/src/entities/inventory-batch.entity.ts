import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('inventory_batches')
export class InventoryBatch {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  batchNumber!: string;

  @Column({ type: 'int' })
  initialQuantity!: number;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  purchasePrice!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  sellingPrice!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  regularPrice!: number;

  @Column({ type: 'date' })
  receivedAt!: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate!: Date | null;

  @ManyToOne(() => Product, (product) => product.batches, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @Column()
  productId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
