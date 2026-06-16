import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FlashSale } from './flash-sale.entity';
import { Product } from './product.entity';

@Entity('flash_sale_products')
export class FlashSaleProduct {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => FlashSale, (flashSale) => flashSale.flashSaleProducts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'flashSaleId' })
  flashSale!: FlashSale;

  @Column()
  flashSaleId!: number;

  @ManyToOne(() => Product, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @Column()
  productId!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercentage!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  salePrice!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
