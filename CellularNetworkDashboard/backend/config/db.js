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

    // Create Users table if not exists using pool
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'viewer') DEFAULT 'viewer',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Auto-seed default Admin & Viewer users if Users table is empty
    const bcrypt = require('bcryptjs');
    const [existingUsers] = await pool.query('SELECT id FROM Users LIMIT 1');
    if (existingUsers.length === 0) {
      const adminHash  = await bcrypt.hash('admin123', 10);
      const viewerHash = await bcrypt.hash('user123', 10);

      await pool.execute(
        `INSERT INTO Users (username, email, password, role) VALUES 
         (?, ?, ?, ?), (?, ?, ?, ?)`,
        [
          'System Admin', 'admin@cellnexus.com', adminHash, 'admin',
          'Network Analyst', 'viewer@cellnexus.com', viewerHash, 'viewer'
        ]
      );
      console.log('✅ Default users created: admin@cellnexus.com (admin123), viewer@cellnexus.com (user123)');
    }
  } catch (error) {
    console.error('Unable to connect to the MySQL database:', error.message);
  }
}

module.exports = { pool, initializeDatabase };
