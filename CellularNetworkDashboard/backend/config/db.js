const mysql = require('mysql2/promise');
require('dotenv').config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || 'ashish@2105#';
const dbName = process.env.DB_NAME || 'cellular_dashboard';
const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306;
const requiresSsl = process.env.DB_SSL === 'true';

// Initialize raw mysql pool
const pool = mysql.createPool({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  port: dbPort,
  ssl: requiresSsl ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initializeDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      port: dbPort,
      ssl: requiresSsl ? { rejectUnauthorized: false } : undefined,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`Database '${dbName}' verified/created via raw SQL.`);

    await connection.end();
  } catch (error) {
    console.error('Unable to connect to the MySQL database:', error.message);
  }
}

module.exports = { pool, initializeDatabase };
