const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'c:/Users/ASUS/Desktop/vms/client/backend/.env' });

async function run() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USERNAME || 'root';
  const password = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'vms_db';

  console.log(`Connecting to database ${dbName} on ${host}:${port}...`);
  try {
    const conn = await mysql.createConnection({ host, port, user, password, database: dbName });
    
    const [tables] = await conn.query('SHOW TABLES');
    console.log('Tables in database:', tables);

    for (const row of tables) {
      const tableName = Object.values(row)[0];
      const [columns] = await conn.query(`DESCRIBE \`${tableName}\``);
      console.log(`\nColumns of ${tableName}:`);
      console.table(columns);
    }

    const [orders] = await conn.query('SELECT * FROM orders LIMIT 2');
    console.log('\nSample Orders:', orders);

    await conn.end();
  } catch (err) {
    console.error('Error connecting or running query:', err);
  }
}

run();
