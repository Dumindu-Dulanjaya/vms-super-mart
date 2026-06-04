const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const { ProductsService } = require('./dist/products/products.service');

async function bootstrap() {
  console.log('Bootstrapping NestJS context for recalculation...');
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const productsService = app.get(ProductsService);
    console.log('Recalculating stock and price for Rice Cooker (ID: 12)...');
    await productsService.recalculateProductStock(12);
    console.log('Recalculation completed successfully!');
    await app.close();
  } catch (err) {
    console.error('Error during NestJS bootstrap:', err);
  }
}
bootstrap();
