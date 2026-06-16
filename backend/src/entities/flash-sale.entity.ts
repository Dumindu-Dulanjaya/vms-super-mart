import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FlashSaleProduct } from './flash-sale-product.entity';

@Entity('flash_sales')
export class FlashSale {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'datetime' })
  startTime!: Date;

  @Column({ type: 'datetime' })
  endTime!: Date;

  @Column({
    type: 'enum',
    enum: ['active', 'scheduled', 'expired'],
    default: 'scheduled',
  })
  status!: 'active' | 'scheduled' | 'expired';

  @Column({ default: false })
  isActive!: boolean;

  @OneToMany(() => FlashSaleProduct, (flashSaleProduct) => flashSaleProduct.flashSale, {
    cascade: true,
  })
  flashSaleProducts!: FlashSaleProduct[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
