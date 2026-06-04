import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { User } from './entities/user.entity';
import { InventoryBatch } from './entities/inventory-batch.entity';
import mysql from 'mysql2/promise';

async function ensureDatabaseExists() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USERNAME || 'root';
  const password = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'vms_db';

  const conn = await mysql.createConnection({ host, port, user, password });
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
  await conn.end();
  console.log('Ensured database exists:', dbName);
}

async function run() {
  await ensureDatabaseExists();

  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vms_db',
    entities: [Category, Product, Order, OrderItem, User, InventoryBatch],
    synchronize: process.env.DB_SYNC === 'true',
  });

  await dataSource.initialize();
  console.log('DB connected for seeding');

  const userRepo = dataSource.getRepository(User);
  const categoryRepo = dataSource.getRepository(Category);
  const productRepo = dataSource.getRepository(Product);
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@vms.com';
  const adminPassword = process.env.ADMIN_PASSWORD || process.env.SUPERADMIN_PASSWORD || 'admin123';

  const existing = await userRepo.findOne({ where: { email: adminEmail } });
  if (existing) {
    console.log('Admin already exists:', existing.email);
  } else {
    const hashed = await bcrypt.hash(adminPassword, 10);

    const admin = userRepo.create({
      firstName: 'Admin',
      lastName: 'Owner',
      email: adminEmail,
      password: hashed,
      role: 'admin',
    });

    await userRepo.save(admin);
    console.log('Admin created:', admin.email);
  }

  const riderEmail = 'rider@vms.com';
  const riderPassword = 'rider123';

  const existingRider = await userRepo.findOne({ where: { email: riderEmail } });
  if (existingRider) {
    console.log('Rider already exists:', existingRider.email);
  } else {
    const hashedRider = await bcrypt.hash(riderPassword, 10);
    const rider = userRepo.create({
      firstName: 'Rider',
      lastName: 'Agent',
      email: riderEmail,
      password: hashedRider,
      role: 'rider',
    });
    await userRepo.save(rider);
    console.log('Rider created:', rider.email);
  }

  const categorySeeds = [
    { slug: 'electronics', label: 'Electronics' },
    { slug: 'toys', label: 'Toys' },
    { slug: 'kitchen', label: 'Kitchen' },
    { slug: 'fashion', label: 'Fashion' },
    { slug: 'sports', label: 'Sports' },
  ];

  for (const categorySeed of categorySeeds) {
    const existingCategory = await categoryRepo.findOne({
      where: { slug: categorySeed.slug },
    });

    if (!existingCategory) {
      await categoryRepo.save(categoryRepo.create(categorySeed));
    }
  }

  const categories = await categoryRepo.find();
  const bySlug = new Map(categories.map((category) => [category.slug, category]));

  const productSeeds = [
    {
      name: 'Classic Headphone',
      price: 1299,
      oldPrice: 1599,
      category: 'electronics',
      image: '/products/headphone.jpg',
      slug: 'classic-headphone',
      rating: 4,
      reviews: 12,
      instock: true,
      description: 'A sample product for the storefront.',
      stock: 50,
      lowStockThreshold: 5,
    },
    {
      name: 'Kids Teddy Bear',
      price: 899,
      oldPrice: 1099,
      category: 'toys',
      image: '/products/teddy.jpg',
      slug: 'kids-teddy-bear',
      rating: 5,
      reviews: 8,
      instock: true,
      description: 'Soft toy example for product listings.',
      stock: 3,
      lowStockThreshold: 5,
    },
    {
      name: 'Kitchen Mug Set',
      price: 499,
      oldPrice: 699,
      category: 'kitchen',
      image: '/products/mugs.jpg',
      slug: 'kitchen-mug-set',
      rating: 4,
      reviews: 5,
      instock: true,
      description: 'Simple starter data for category pages.',
      stock: 100,
      lowStockThreshold: 10,
    },
  ];

  for (const productSeed of productSeeds) {
    const existingProduct = await productRepo.findOne({
      where: { slug: productSeed.slug },
    });

    if (!existingProduct) {
      const category = bySlug.get(productSeed.category) ?? null;
      await productRepo.save(
        productRepo.create({
          name: productSeed.name,
          price: productSeed.price,
          oldPrice: productSeed.oldPrice,
          image: productSeed.image,
          slug: productSeed.slug,
          rating: productSeed.rating,
          reviews: productSeed.reviews,
          instock: productSeed.instock,
          description: productSeed.description,
          stock: productSeed.stock,
          lowStockThreshold: productSeed.lowStockThreshold,
          category,
        }),
      );
    }
  }
  console.log('Categories and products seeded');

  // Seed a sample order if none exist
  const orderRepo = dataSource.getRepository(Order);
  const orderItemRepo = dataSource.getRepository(OrderItem);
  const existingOrders = await orderRepo.count();
  if (existingOrders === 0) {
    const prod = await productRepo.findOne({ where: { slug: 'classic-headphone' } });
    if (prod) {
      const item = orderItemRepo.create({
        productId: prod.id,
        name: prod.name,
        price: prod.price,
        quantity: 1,
        total: prod.price,
      });

      const order = orderRepo.create({
        id: `ord_${Date.now()}`,
        status: 'placed',
        customer: {
          firstName: 'Seed',
          lastName: 'User',
          email: 'seed@example.com',
        },
        paymentMethod: 'card',
        summary: { subtotal: prod.price, discount: 0, shipping: 0, total: prod.price },
        items: [item],
      });

      await orderRepo.save(order);
      console.log('Sample order seeded:', order.id);
    }
  }
  await dataSource.destroy();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
