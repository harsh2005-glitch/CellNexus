const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function pushToAiven() {
  console.log('Connecting to Aiven Cloud Database...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT) || 20035,
    database: process.env.DB_NAME || 'defaultdb',
    ssl: { rejectUnauthorized: false },
    multipleStatements: true
  });

  console.log('Connected! Reading database.sql...');
  const sql = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');

  console.log('Executing Schema and Data creation (Building Tables)...');
  await connection.query(sql);
  
  console.log('✅ Aiven Database perfectly initialized with Towers and valid Schema!');
  
  await connection.end();
}

pushToAiven().catch(err => {
  console.error('Failed to initialize Aiven:', err);
});
