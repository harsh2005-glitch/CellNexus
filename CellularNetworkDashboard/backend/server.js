const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
require('dotenv').config();

const csvDataList = [];
fs.createReadStream(path.join(__dirname, 'callstats_900.csv'))
  .pipe(csv())
  .on('data', (row) => csvDataList.push(row))
  .on('end', () => console.log('Loaded new 900-row CSV for live simulation.'));

// Global states for Geographical Data Slicing engine
let towerMappingInitialised = false;
const towerCursors = {};

const { initializeDatabase, pool } = require('./config/db');
// Removed: require('./models') since we dropped Sequelize

const app = express();
const server = http.createServer(app);

// ── CORS: allow localhost dev + deployed Vercel frontend ────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  process.env.CLIENT_URL,          // Set this on Render: your Vercel URL
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app')
    ) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        callback(null, true);
      } else {
        callback(new Error(`Socket CORS blocked: ${origin}`));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.raw({ type: 'application/octet-stream', limit: '50mb' }));

// Import Routes
const towerRoutes = require('./routes/towers');
const speedTestRoutes = require('./routes/speedTests');
const { router: authRoutes } = require('./routes/auth');
const alertRoutes = require('./routes/alerts');

app.use('/api/towers', towerRoutes);
app.use('/api/speed-tests', speedTestRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertRoutes);

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running' });
});

// Socket.io connection handling & Real-time Telemetry Simulator
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Real-time wow factor: Every 3 seconds, we broadcast random fluctuations
  // for a random subset of towers to simulate live network traffic.
  const interval = setInterval(async () => {
    try {
      // Update all towers synchronously every 3 seconds so individual graphs tick perfectly seamlessly
      const [towers] = await pool.query('SELECT * FROM Towers');
      
      // 1. Array Slicing Initialization
      if (!towerMappingInitialised && csvDataList.length > 0 && towers.length > 0) {
          const sliceSize = Math.floor(csvDataList.length / towers.length);
          let mappingText = "Network Architecture: Geographical Data Slicing Map\n";
          mappingText += "===================================================\n\n";
          mappingText += "| Tower ID | Location         | Operator      | CSV Assigned Range |\n";
          mappingText += "|----------|------------------|---------------|--------------------|\n";
          
          towers.forEach((tower, i) => {
              const start = i * sliceSize;
              // The last tower absorbs any remainder rows
              const end = (i === towers.length - 1) ? csvDataList.length - 1 : (i + 1) * sliceSize - 1;
              towerCursors[tower.id] = { startIndex: start, endIndex: end, currentOffset: 0 };
              
              const tid = String(tower.id).padEnd(8);
              const loc = String(tower.locationName).padEnd(16);
              const op = String(tower.operatorName).padEnd(13);
              const range = `[${start} to ${end}]`.padEnd(18);
              
              mappingText += `| ${tid} | ${loc} | ${op} | ${range} |\n`;
          });
          
          try {
            fs.writeFileSync(path.join(__dirname, 'tower_data_mapping.txt'), mappingText);
            console.log("Successfully generated tower_data_mapping.txt for academic verification!");
          } catch (fsErr) {
            // Serverless/read-only filesystem — skip file write, log to console instead
            console.log("[INFO] tower_data_mapping.txt skipped (read-only FS):", fsErr.message);
          }
          towerMappingInitialised = true;
      }
      
      const updates = await Promise.all(towers.map(async (tower) => {
        // 2. Localized Traversal
        let targetRow;
        if (towerMappingInitialised && towerCursors[tower.id]) {
            const cursor = towerCursors[tower.id];
            const absoluteIndex = cursor.startIndex + cursor.currentOffset;
            targetRow = csvDataList[absoluteIndex];
            
            // Advance the cursor for this specific tower; Loop seamlessly if hit limit
            cursor.currentOffset++;
            if (cursor.startIndex + cursor.currentOffset > cursor.endIndex) {
                cursor.currentOffset = 0;
            }
        } else {
            targetRow = { 'Incoming Calls': 100, 'Answered Calls': 80 }; // Loading fallback
        }
        
        const incomingCalls = parseInt(targetRow['Incoming Calls'], 10) || 0;
        const callAccepted = parseInt(targetRow['Answered Calls'], 10) || 0;
        const callTotal = incomingCalls;
        const callBlocked = Math.max(0, callTotal - callAccepted);
        const connectedUsers = 8432; // System default fixed amount
        
        let responseTimeSecs = 0;
        const speedStr = targetRow['Response Time'] || targetRow['Response Time '] || targetRow['Answer Speed (AVG)'];
        if (speedStr && typeof speedStr === 'string') {
          const p = speedStr.split(':').map(n => Number(n) || 0);
          if (p.length === 3) responseTimeSecs = p[0]*3600 + p[1]*60 + p[2];
          else if (p.length === 2) responseTimeSecs = p[0]*60 + p[1];
          else responseTimeSecs = p[0];
        }
        if (responseTimeSecs <= 0) responseTimeSecs = Math.floor(Math.random() * 25) + 5; // fallback so it never shows 0s if CSV fails

        // Save strictly required data to DB via raw SQL
        const [result] = await pool.execute(
          `INSERT INTO Telemetries (towerId, callTotal, callAccepted, latency, timestamp) 
           VALUES (?, ?, ?, ?, NOW())`,
          [tower.id, callTotal, callAccepted, responseTimeSecs]
        );

        // ── Auto-Alert Generation ────────────────────────────────────────────
        const answerRate = callTotal > 0 ? callAccepted / callTotal : 1;
        const incomingHandoff = callTotal * 0.3;
        const answeredHandoff = Math.round(incomingHandoff * answerRate);
        const droppedHandoff = Math.max(0, Math.round(incomingHandoff) - answeredHandoff);
        const droppingProb = incomingHandoff > 0 ? droppedHandoff / incomingHandoff : 0;

        let alertType = null;
        let alertSeverity = null;
        let alertMessage = null;

        if (droppingProb > 0.10) {
          alertType = 'TOWER_OFFLINE';
          alertSeverity = 'CRITICAL';
          alertMessage = `Tower ${tower.id} (${tower.locationName}) is OFFLINE — call drop rate ${(droppingProb * 100).toFixed(1)}%`;
        } else if (droppingProb > 0.07) {
          alertType = 'SIGNAL_DEGRADED';
          alertSeverity = 'WARNING';
          alertMessage = `Tower ${tower.id} (${tower.locationName}) signal DEGRADED — drop rate ${(droppingProb * 100).toFixed(1)}%`;
        } else if (droppingProb > 0.04) {
          alertType = 'HIGH_CALL_DROP';
          alertSeverity = 'WARNING';
          alertMessage = `Tower ${tower.id} (${tower.locationName}) experiencing high call-drop rate ${(droppingProb * 100).toFixed(1)}%`;
        } else if (responseTimeSecs > 60) {
          alertType = 'LATENCY_SPIKE';
          alertSeverity = 'INFO';
          alertMessage = `Tower ${tower.id} (${tower.locationName}) latency spike detected — ${responseTimeSecs}s response time`;
        }

        let newAlert = null;
        if (alertType) {
          // Only create alert if there's no recent ACTIVE alert of the same type for this tower (last 60s)
          const [existing] = await pool.query(
            `SELECT id FROM Alerts WHERE towerId = ? AND type = ? AND status = 'ACTIVE' AND timestamp > DATE_SUB(NOW(), INTERVAL 60 SECOND) LIMIT 1`,
            [tower.id, alertType]
          );
          if (existing.length === 0) {
            const [alertResult] = await pool.execute(
              `INSERT INTO Alerts (towerId, towerName, type, severity, message, status, timestamp)
               VALUES (?, ?, ?, ?, ?, 'ACTIVE', NOW())`,
              [tower.id, `${tower.operatorName} – ${tower.locationName}`, alertType, alertSeverity, alertMessage]
            );
            const [alertRows] = await pool.query('SELECT * FROM Alerts WHERE id = ?', [alertResult.insertId]);
            newAlert = alertRows[0] || null;
          }
        }

        return {
          towerId: tower.id,
          telemetry: {
            id: result.insertId,
            towerId: tower.id,
            connectedUsers,
            callTotal,
            callAccepted,
            callBlocked,
            timestamp: new Date()
          },
          newAlert
        };
      }));

      // Broadcast to all connected clients
      socket.emit('telemetry_update', updates);

      // Broadcast any new alerts
      const freshAlerts = updates.filter(u => u.newAlert).map(u => u.newAlert);
      if (freshAlerts.length > 0) {
        io.emit('new_alerts', freshAlerts);
      }
    } catch (err) {
      console.error('Simulation error:', err.message);
    }
  }, 3000);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    clearInterval(interval);
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  // 1. Initialize DB (create tables if missing, seed default users)
  await initializeDatabase();
  
  // 2. Start Express + Socket.io server
  server.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 Allowed CORS origins: ${allowedOrigins.join(', ')}`);
  });
}

startServer();

module.exports = { app, io };
