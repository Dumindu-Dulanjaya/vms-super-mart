import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 180 })
  name!: string;

  @Column({ unique: true, length: 180 })
  slug!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  oldPrice!: number;

  @Column({ type: 'varchar', length: 255 })
  image!: string;

  @Column({ type: 'json', nullable: true })
  images?: string[]; // Array of image URLs for product gallery (4-5 high-res images)

  @Column({ type: 'int', default: 0 })
  rating!: number;

  @Column({ type: 'int', default: 0 })
  reviews!: number;

  @Column({ type: 'int', default: 0 })
  stock!: number;

  @Column({ type: 'int', default: 5 })
  lowStockThreshold!: number;

  @Column({ default: true })
  instock!: boolean;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @ManyToOne(() => Category, (category) => category.products, {
    eager: true,
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'categoryId' })
  category!: Category | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}