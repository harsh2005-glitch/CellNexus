/**
 * init_db.js — One-time cloud database initializer
 * Run this ONCE against your Aiven MySQL instance to create all tables + seed towers.
 * 
 * Usage:
 *   node init_db.js
 */

const { pool } = require('./config/db');

const realIndianTowers = [
  // 📍 MUMBAI METRO (Jio, Airtel, Vi)
  { radio: '4G', operatorName: 'Jio', mcc: 404, mnc: 69, latitude: 19.0760, longitude: 72.8777, coverageRadius: 1200, cid: 211314, locationName: 'Mumbai (Dharavi)', status: 'GOOD' },
  { radio: '4G', operatorName: 'Jio', mcc: 404, mnc: 92, latitude: 18.9864, longitude: 72.8386, coverageRadius: 1000, cid: 2317360, locationName: 'Mumbai (Dadra)', status: 'GOOD' },
  { radio: '5G', operatorName: 'Jio', mcc: 404, mnc: 5,  latitude: 19.0399, longitude: 73.0199, coverageRadius: 1500, cid: 409121, locationName: 'Navi Mumbai', status: 'GOOD' },
  { radio: '4G', operatorName: 'Airtel', mcc: 404, mnc: 31, latitude: 19.0176, longitude: 72.8561, coverageRadius: 1100, cid: 74120, locationName: 'Mumbai (Wadala)', status: 'GOOD' },
  { radio: '4G', operatorName: 'Vi', mcc: 404, mnc: 27, latitude: 19.3489, longitude: 72.8469, coverageRadius: 900, cid: 63991, locationName: 'Mumbai (Vasai)', status: 'GOOD' },

  // 📍 DELHI NCR (Jio, Airtel, Vi, BSNL)
  { radio: '5G', operatorName: 'Jio', mcc: 404, mnc: 10, latitude: 28.6139, longitude: 77.2090, coverageRadius: 1400, cid: 279420, locationName: 'Delhi (Connaught Place)', status: 'GOOD' },
  { radio: '4G', operatorName: 'Airtel', mcc: 404, mnc: 10, latitude: 28.5355, longitude: 77.3910, coverageRadius: 1100, cid: 58192, locationName: 'Noida (Sector 62)', status: 'GOOD' },
  { radio: '4G', operatorName: 'Vi', mcc: 404, mnc: 11, latitude: 28.4595, longitude: 77.0266, coverageRadius: 1000, cid: 48102, locationName: 'Gurugram (DLF CyberHub)', status: 'DEGRADED' },
  { radio: '4G', operatorName: 'BSNL', mcc: 404, mnc: 74, latitude: 28.6508, longitude: 77.2315, coverageRadius: 850, cid: 19201, locationName: 'Delhi (Chandni Chowk)', status: 'GOOD' },

  // 📍 BANGALORE / BENGALURU (Jio, Airtel, Vi, BSNL)
  { radio: '5G', operatorName: 'Jio', mcc: 404, mnc: 5, latitude: 12.9716, longitude: 77.5946, coverageRadius: 1500, cid: 38291, locationName: 'Bangalore (MG Road)', status: 'GOOD' },
  { radio: '4G', operatorName: 'Airtel', mcc: 404, mnc: 45, latitude: 12.9352, longitude: 77.6245, coverageRadius: 1000, cid: 62641, locationName: 'Bangalore (Koramangala)', status: 'GOOD' },
  { radio: '4G', operatorName: 'Vi', mcc: 404, mnc: 45, latitude: 12.9696, longitude: 77.6437, coverageRadius: 950, cid: 15111, locationName: 'Bangalore (Indiranagar)', status: 'GOOD' },
  { radio: '4G', operatorName: 'BSNL', mcc: 404, mnc: 74, latitude: 12.9915, longitude: 77.5712, coverageRadius: 900, cid: 31029, locationName: 'Bangalore (Malleshwaram)', status: 'DEGRADED' },

  // 📍 KOLKATA METRO & HOWRAH (Airtel, Jio, Vi, BSNL)
  { radio: '5G', operatorName: 'Jio', mcc: 404, mnc: 75, latitude: 22.5726, longitude: 88.3639, coverageRadius: 1300, cid: 74110, locationName: 'Kolkata (Esplanade)', status: 'GOOD' },
  { radio: '5G', operatorName: 'Jio', mcc: 404, mnc: 75, latitude: 22.5801, longitude: 88.4350, coverageRadius: 1400, cid: 82019, locationName: 'Kolkata (Salt Lake Sector V)', status: 'GOOD' },
  { radio: '4G', operatorName: 'Airtel', mcc: 404, mnc: 31, latitude: 22.5532, longitude: 88.3524, coverageRadius: 1100, cid: 38192, locationName: 'Kolkata (Park Street)', status: 'GOOD' },
  { radio: '5G', operatorName: 'Airtel', mcc: 404, mnc: 31, latitude: 22.5856, longitude: 88.4712, coverageRadius: 1500, cid: 91024, locationName: 'Kolkata (New Town Action Area 1)', status: 'GOOD' },
  { radio: '4G', operatorName: 'Vi', mcc: 404, mnc: 75, latitude: 22.5645, longitude: 88.3698, coverageRadius: 950, cid: 47219, locationName: 'Kolkata (Sealdah)', status: 'GOOD' },
  { radio: '4G', operatorName: 'BSNL', mcc: 404, mnc: 74, latitude: 22.6012, longitude: 88.3754, coverageRadius: 900, cid: 61103, locationName: 'Kolkata (Shyambazar)', status: 'DEGRADED' },
  { radio: '4G', operatorName: 'Jio', mcc: 404, mnc: 75, latitude: 22.6215, longitude: 88.4123, coverageRadius: 1200, cid: 55102, locationName: 'Kolkata (Dum Dum / Airport)', status: 'GOOD' },
  { radio: '4G', operatorName: 'Airtel', mcc: 404, mnc: 31, latitude: 22.4985, longitude: 88.3712, coverageRadius: 1050, cid: 29104, locationName: 'Kolkata (Jadavpur)', status: 'GOOD' },
  { radio: '4G', operatorName: 'Vi', mcc: 404, mnc: 75, latitude: 22.4712, longitude: 88.3795, coverageRadius: 850, cid: 19204, locationName: 'Kolkata (Garia Bus Depot)', status: 'DEGRADED' },
  { radio: '5G', operatorName: 'Jio', mcc: 404, mnc: 75, latitude: 22.5312, longitude: 88.3324, coverageRadius: 1300, cid: 88102, locationName: 'Kolkata (Alipore)', status: 'GOOD' },
  { radio: '4G', operatorName: 'Airtel', mcc: 404, mnc: 31, latitude: 22.5367, longitude: 88.3654, coverageRadius: 1000, cid: 47102, locationName: 'Kolkata (Ballygunge)', status: 'GOOD' },
  { radio: '4G', operatorName: 'BSNL', mcc: 404, mnc: 74, latitude: 22.5124, longitude: 88.3215, coverageRadius: 800, cid: 10294, locationName: 'Kolkata (Behala Chowrasta)', status: 'OFFLINE' },

  // 🌉 HOWRAH DISTRICT TOWERS
  { radio: '5G', operatorName: 'Jio', mcc: 404, mnc: 75, latitude: 22.5839, longitude: 88.3426, coverageRadius: 1400, cid: 66102, locationName: 'Howrah (Railway Station)', status: 'GOOD' },
  { radio: '4G', operatorName: 'Airtel', mcc: 404, mnc: 31, latitude: 22.5698, longitude: 88.3214, coverageRadius: 1100, cid: 54109, locationName: 'Howrah (Shibpur Mandirtala)', status: 'GOOD' },
  { radio: '4G', operatorName: 'Vi', mcc: 404, mnc: 75, latitude: 22.5512, longitude: 88.2985, coverageRadius: 900, cid: 33104, locationName: 'Howrah (Nabanna State Secretariat)', status: 'GOOD' },
  { radio: '4G', operatorName: 'BSNL', mcc: 404, mnc: 74, latitude: 22.5812, longitude: 88.3124, coverageRadius: 850, cid: 21094, locationName: 'Howrah (Salkia AC Market)', status: 'DEGRADED' },
  { radio: '5G', operatorName: 'Airtel', mcc: 404, mnc: 31, latitude: 22.6512, longitude: 88.3412, coverageRadius: 1300, cid: 77102, locationName: 'Howrah (Bally Bazar)', status: 'GOOD' },
  { radio: '4G', operatorName: 'Jio', mcc: 404, mnc: 75, latitude: 22.5694, longitude: 88.2612, coverageRadius: 1200, cid: 84102, locationName: 'Howrah (Santragachi Junction)', status: 'GOOD' },
  { radio: '4G', operatorName: 'Vi', mcc: 404, mnc: 75, latitude: 22.6124, longitude: 88.3312, coverageRadius: 950, cid: 41092, locationName: 'Howrah (Liluah)', status: 'GOOD' },
  { radio: '4G', operatorName: 'BSNL', mcc: 404, mnc: 74, latitude: 22.6298, longitude: 88.3485, coverageRadius: 800, cid: 19042, locationName: 'Howrah (Belur Math)', status: 'GOOD' },
  { radio: '4G', operatorName: 'Jio', mcc: 404, mnc: 75, latitude: 22.5912, longitude: 88.2412, coverageRadius: 1100, cid: 90124, locationName: 'Howrah (Kona Expressway)', status: 'GOOD' },

  // 📍 CHENNAI METRO (Jio, Airtel, Vi)
  { radio: '5G', operatorName: 'Jio', mcc: 404, mnc: 42, latitude: 13.0827, longitude: 80.2707, coverageRadius: 1300, cid: 38596, locationName: 'Chennai (Central)', status: 'GOOD' },
  { radio: '4G', operatorName: 'Airtel', mcc: 404, mnc: 43, latitude: 12.9229, longitude: 80.1275, coverageRadius: 1000, cid: 57292, locationName: 'Chennai (Tambaram)', status: 'GOOD' },
  { radio: '4G', operatorName: 'Vi', mcc: 404, mnc: 43, latitude: 13.0604, longitude: 80.2496, coverageRadius: 950, cid: 28190, locationName: 'Chennai (Nungambakkam)', status: 'GOOD' },

  // 📍 HYDERABAD METRO (Jio, Airtel, Vi)
  { radio: '5G', operatorName: 'Jio', mcc: 404, mnc: 5, latitude: 17.4486, longitude: 78.3908, coverageRadius: 1400, cid: 98120, locationName: 'Hyderabad (HITECH City)', status: 'GOOD' },
  { radio: '4G', operatorName: 'Airtel', mcc: 404, mnc: 49, latitude: 17.3850, longitude: 78.4867, coverageRadius: 1050, cid: 48190, locationName: 'Hyderabad (Charminar)', status: 'GOOD' },
  { radio: '4G', operatorName: 'Vi', mcc: 404, mnc: 49, latitude: 17.4065, longitude: 78.4772, coverageRadius: 900, cid: 39182, locationName: 'Hyderabad (Banjara Hills)', status: 'GOOD' },

  // 📍 AHMEDABAD & RAJKOT (Jio, Airtel, Vi)
  { radio: '4G', operatorName: 'Jio', mcc: 404, mnc: 5, latitude: 20.9131, longitude: 70.3804, coverageRadius: 1000, cid: 2171, locationName: 'Rajkot', status: 'GOOD' },
  { radio: '4G', operatorName: 'Airtel', mcc: 404, mnc: 57, latitude: 23.0211, longitude: 72.5997, coverageRadius: 1100, cid: 62141, locationName: 'Ahmedabad (Navrangpura)', status: 'GOOD' },
  { radio: '4G', operatorName: 'Vi', mcc: 404, mnc: 5, latitude: 22.6284, longitude: 70.9407, coverageRadius: 1000, cid: 14318, locationName: 'Ahmedabad (SG Highway)', status: 'GOOD' },

  // 📍 PUNE METRO (Jio, Airtel, Vi)
  { radio: '4G', operatorName: 'Airtel', mcc: 404, mnc: 86, latitude: 15.4440, longitude: 75.0043, coverageRadius: 1000, cid: 2221, locationName: 'Pune (Kothrud)', status: 'GOOD' },
  { radio: '4G', operatorName: 'Vi', mcc: 404, mnc: 27, latitude: 18.5634, longitude: 73.7807, coverageRadius: 1050, cid: 10742, locationName: 'Pune (Hinjewadi IT Park)', status: 'GOOD' },
  { radio: '4G', operatorName: 'Jio', mcc: 404, mnc: 2, latitude: 18.5204, longitude: 73.8567, coverageRadius: 1200, cid: 32851, locationName: 'Pune (Shivajinagar)', status: 'GOOD' },
];

async function initAndSeed() {
  console.log('🚀 CellNexus Cloud DB Initializer\n');

  try {
    // ── 1. Create all tables ─────────────────────────────────────────────
    console.log('📋 Creating tables...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS Towers (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        radio         VARCHAR(255) NOT NULL,
        operatorName  VARCHAR(255) NOT NULL,
        mcc           INT NOT NULL,
        mnc           INT NOT NULL,
        longitude     FLOAT NOT NULL,
        latitude      FLOAT NOT NULL,
        coverageRadius INT NOT NULL DEFAULT 1000,
        cid           INT NOT NULL,
        locationName  VARCHAR(255),
        status        VARCHAR(255) DEFAULT 'GOOD',
        createdAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ Towers table ready');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS Telemetries (
        id           INT AUTO_INCREMENT PRIMARY KEY,
        towerId      INT NOT NULL,
        latency      INT NOT NULL DEFAULT 0,
        callTotal    INT NOT NULL DEFAULT 0,
        callAccepted INT NOT NULL DEFAULT 0,
        timestamp    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ Telemetries table ready');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS Users (
        id        INT AUTO_INCREMENT PRIMARY KEY,
        username  VARCHAR(255) NOT NULL,
        email     VARCHAR(255) NOT NULL UNIQUE,
        password  VARCHAR(255) NOT NULL,
        role      ENUM('admin', 'viewer') DEFAULT 'viewer',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ Users table ready');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS SpeedTests (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        downloadSpeed FLOAT NOT NULL,
        uploadSpeed   FLOAT NOT NULL,
        latency       INT NOT NULL,
        timestamp     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ SpeedTests table ready');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS Alerts (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        towerId    INT NOT NULL,
        towerName  VARCHAR(255),
        type       VARCHAR(100) NOT NULL,
        severity   ENUM('INFO', 'WARNING', 'CRITICAL') DEFAULT 'INFO',
        message    TEXT,
        status     ENUM('ACTIVE', 'RESOLVED') DEFAULT 'ACTIVE',
        timestamp  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ Alerts table ready');

    // ── 2. Seed default admin + viewer users ─────────────────────────────
    const bcrypt = require('bcryptjs');
    const [existingUsers] = await pool.query('SELECT id FROM Users LIMIT 1');
    if (existingUsers.length === 0) {
      const adminHash  = await bcrypt.hash('admin123', 10);
      const viewerHash = await bcrypt.hash('user123', 10);
      await pool.execute(
        `INSERT INTO Users (username, email, password, role) VALUES (?, ?, ?, ?), (?, ?, ?, ?)`,
        [
          'System Admin',    'admin@cellnexus.com',  adminHash,  'admin',
          'Network Analyst', 'viewer@cellnexus.com', viewerHash, 'viewer',
        ]
      );
      console.log('\n👤 Default users created:');
      console.log('   admin@cellnexus.com  / admin123  (admin)');
      console.log('   viewer@cellnexus.com / user123   (viewer)');
    } else {
      console.log('\n👤 Users already exist — skipping user seed');
    }

    // ── 3. Seed 46 real Indian towers ────────────────────────────────────
    const [existingTowers] = await pool.query('SELECT COUNT(*) as count FROM Towers');
    if (existingTowers[0].count > 0) {
      console.log(`\n📡 Towers already seeded (${existingTowers[0].count} found). Truncating and re-seeding...`);
      await pool.query('SET FOREIGN_KEY_CHECKS = 0');
      await pool.query('TRUNCATE TABLE Telemetries');
      await pool.query('TRUNCATE TABLE Towers');
      await pool.query('TRUNCATE TABLE Alerts');
      await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    }

    console.log('\n📡 Seeding 46 real Indian cell towers...');
    for (const t of realIndianTowers) {
      await pool.execute(
        `INSERT INTO Towers (radio, operatorName, mcc, mnc, longitude, latitude, coverageRadius, cid, locationName, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [t.radio, t.operatorName, t.mcc, t.mnc, t.longitude, t.latitude, t.coverageRadius, t.cid, t.locationName, t.status]
      );
    }

    const [countResult] = await pool.query('SELECT COUNT(*) as count FROM Towers');
    console.log(`\n✅ SUCCESS! ${countResult[0].count} towers now in database.`);
    console.log('\n🎉 CellNexus cloud database is fully initialized and ready!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Initialization failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

initAndSeed();
