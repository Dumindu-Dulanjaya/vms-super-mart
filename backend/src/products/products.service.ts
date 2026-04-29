import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';

type ProductResponse = {
  id: number;
  name: string;
  price: number;
  oldPrice: number;
  category: string;
  image: string;
  slug: string;
  rating: number;
  reviews: number;
  instock: boolean;
  description: string | null;
};

type CreateProductInput = {
  name: string;
  price: number;
  oldPrice: number;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  instock: boolean;
  description: string;
  slug?: string;
};

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  private toResponse(product: Product): ProductResponse {
    return {
      id: product.id,
      name: product.name,
      price: Number(product.price),
      oldPrice: Number(product.oldPrice),
      category: product.category?.slug ?? '',
      image: product.image,
      slug: product.slug,
      rating: product.rating,
      reviews: product.reviews,
      instock: product.instock,
      description: product.description,
    };
  }

  async findAll() {
    const products = await this.productRepository.find({
      relations: ['category'],
      order: { id: 'ASC' },
    });
    return products.map((product) => this.toResponse(product));
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return this.toResponse(product);
  }

  async findBySlug(slug: string) {
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    return this.toResponse(product);
  }

  async findByCategory(category: string) {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('LOWER(category.slug) = LOWER(:category)', { category })
      .orderBy('product.id', 'ASC')
      .getMany();

    return products.map((product) => this.toResponse(product));
  }

  async create(productInput: CreateProductInput) {
    const slug =
      productInput.slug ||
      productInput.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

    const categorySlug = (productInput.category || 'misc').toLowerCase();
    let category = await this.categoryRepository.findOne({
      where: { slug: categorySlug },
    });

    if (!category) {
      category = this.categoryRepository.create({
        slug: categorySlug,
        label: productInput.category,
      });
      category = await this.categoryRepository.save(category);
    }

    const product = this.productRepository.create({
      name: productInput.name,
      slug,
      price: productInput.price,
      oldPrice: productInput.oldPrice,
      image: productInput.image,
      rating: productInput.rating,
      reviews: productInput.reviews,
      instock: productInput.instock,
      description: productInput.description,
      category,
    });

    const saved = await this.productRepository.save(product);
    return this.toResponse(saved);
  }

  async update(id: number, updateInput: Partial<CreateProductInput>) {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['category'] });
    if (!product) throw new NotFoundException(`Product with id ${id} not found`);

    if (updateInput.name) product.name = updateInput.name;
    if (updateInput.price !== undefined) product.price = updateInput.price as any;
    if (updateInput.oldPrice !== undefined) product.oldPrice = updateInput.oldPrice as any;
    if (updateInput.image !== undefined) product.image = updateInput.image;
    if (updateInput.description !== undefined) product.description = updateInput.description;
    if (updateInput.category) {
      const categorySlug = updateInput.category.toLowerCase();
      let category = await this.categoryRepository.findOne({ where: { slug: categorySlug } });
      if (!category) {
        category = this.categoryRepository.create({ slug: categorySlug, label: updateInput.category });
        category = await this.categoryRepository.save(category);
      }
      product.category = category;
    }

    const saved = await this.productRepository.save(product);
    return this.toResponse(saved);
  }

  async remove(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product with id ${id} not found`);
    await this.productRepository.remove(product);
    return { success: true };
  }
}
