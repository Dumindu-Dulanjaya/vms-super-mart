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
    { slug: 'fresh-vegetables', label: 'Fresh Vegetables' },
    { slug: 'fruits', label: 'Fruits' },
    { slug: 'dairy-eggs', label: 'Dairy & Eggs' },
    { slug: 'meat-seafood', label: 'Meat & Seafood' },
    { slug: 'beverages', label: 'Beverages' },
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
    {
      name: 'Local Red Onions',
      price: 180,
      oldPrice: 220,
      category: 'fresh-vegetables',
      image: 'https://cdn-icons-png.flaticon.com/512/3501/3501869.png',
      slug: 'local-red-onions',
      rating: 5,
      reviews: 4,
      instock: true,
      description: 'Freshly harvested local red onions. Perfect as a base for Sri Lankan curries, salads, and everyday cooking.',
      stock: 50,
      lowStockThreshold: 5,
    },
    {
      name: 'Organic Carrots',
      price: 240,
      oldPrice: 280,
      category: 'fresh-vegetables',
      image: 'https://cdn-icons-png.flaticon.com/512/4056/4056860.png',
      slug: 'organic-carrots',
      rating: 4,
      reviews: 6,
      instock: true,
      description: 'Crisp, sweet, and highly nutritious carrots grown without synthetic pesticides. Ideal for juices, salads, and soups.',
      stock: 30,
      lowStockThreshold: 5,
    },
    {
      name: 'Imported Gala Apples',
      price: 650,
      oldPrice: 750,
      category: 'fruits',
      image: 'https://cdn-icons-png.flaticon.com/512/415/415733.png',
      slug: 'imported-gala-apples',
      rating: 5,
      reviews: 3,
      instock: true,
      description: 'Crisp and exceptionally sweet Gala apples imported fresh. High in dietary fiber and essential vitamins.',
      stock: 40,
      lowStockThreshold: 5,
    },
    {
      name: 'Organic Avocado',
      price: 120,
      oldPrice: 150,
      category: 'fruits',
      image: 'https://cdn-icons-png.flaticon.com/512/2909/2909772.png',
      slug: 'organic-avocado',
      rating: 4,
      reviews: 2,
      instock: true,
      description: 'Buttery, rich local avocados. Perfect for smoothies, healthy spreads, or as a fresh addition to salads.',
      stock: 10,
      lowStockThreshold: 5,
    },
    {
      name: 'Fresh Dairy Milk',
      price: 450,
      oldPrice: 480,
      category: 'dairy-eggs',
      image: 'https://cdn-icons-png.flaticon.com/512/372/372982.png',
      slug: 'fresh-dairy-milk',
      rating: 5,
      reviews: 10,
      instock: true,
      description: '100% pure pasteurized fresh cow milk. Sourced from local dairy farms and packed with calcium and protein.',
      stock: 25,
      lowStockThreshold: 5,
    },
    {
      name: 'Cheddar Cheese Block',
      price: 850,
      oldPrice: 950,
      category: 'dairy-eggs',
      image: 'https://cdn-icons-png.flaticon.com/512/2206/2206179.png',
      slug: 'cheddar-cheese-block',
      rating: 4,
      reviews: 5,
      instock: true,
      description: 'Rich, creamy cheddar cheese block aged for premium sharp flavor. Perfect for sandwiches, grating, and melting.',
      stock: 15,
      lowStockThreshold: 5,
    },
    {
      name: 'Fresh Chicken Breast',
      price: 720,
      oldPrice: 800,
      category: 'meat-seafood',
      image: 'https://cdn-icons-png.flaticon.com/512/1041/1041375.png',
      slug: 'fresh-chicken-breast',
      rating: 4,
      reviews: 8,
      instock: true,
      description: 'Boneless, skinless fresh chicken breast. Lean meat source packed with protein, prepared under strict hygienic standards.',
      stock: 20,
      lowStockThreshold: 5,
    },
    {
      name: 'Coca-Cola Zero Can',
      price: 180,
      oldPrice: 180,
      category: 'beverages',
      image: 'https://cdn-icons-png.flaticon.com/512/2405/2405479.png',
      slug: 'coca-cola-zero-can',
      rating: 5,
      reviews: 15,
      instock: true,
      description: 'The great refreshing taste of Coca-Cola with zero sugar. Serve chilled for maximum refreshment.',
      stock: 60,
      lowStockThreshold: 5,
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
