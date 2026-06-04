const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USERNAME || 'root';
  const password = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'vms_db';

  console.log(`Connecting to database ${dbName}...`);
  try {
    const conn = await mysql.createConnection({ host, port, user, password, database: dbName });
    
    // Let's find all products and their batches
    const [products] = await conn.query('SELECT id, name, price, oldPrice FROM products');
    console.log('All Products:', products);

    for (const p of products) {
      const [batches] = await conn.query('SELECT * FROM inventory_batches WHERE productId = ?', [p.id]);
      console.log(`Batches for product ${p.name} (ID: ${p.id}):`, batches);

      // If there are batches with sellingPrice = 0, update them
      for (const b of batches) {
        if (Number(b.sellingPrice) === 0) {
          // Fallback to product price (or purchasePrice / 0.7 if product price is already updated)
          // Wait! In this case, since the rice cooker price is already updated to 5500, let's look at the batch number
          // or purchase price to determine the correct selling price.
          // If it is BATCH-INIT or BATCH-ADJ, we can set it to the product's oldPrice (which was Rs. 4800!).
          let targetSellingPrice = Number(p.price);
          if (p.name.toLowerCase().includes('rice') && Number(p.oldPrice) > 0) {
            targetSellingPrice = Number(p.oldPrice);
          }
          console.log(`Updating batch ${b.batchNumber} (ID: ${b.id}) sellingPrice to Rs. ${targetSellingPrice}`);
          await conn.query('UPDATE inventory_batches SET sellingPrice = ? WHERE id = ?', [targetSellingPrice, b.id]);
        }
      }
    }

    // Now let's trigger a recalculation by updating the product price to the oldest active batch's price
    // We can do this through the app, but let's first run this DB script.
    await conn.end();
    console.log('DB Update Completed successfully.');
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
