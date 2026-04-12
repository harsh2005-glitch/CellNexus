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
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.raw({ type: 'application/octet-stream', limit: '50mb' }));

// Import Routes
const towerRoutes = require('./routes/towers');
const speedTestRoutes = require('./routes/speedTests');
// Removed: const { Tower, Telemetry } = require('./models');

app.use('/api/towers', towerRoutes);
app.use('/api/speed-tests', speedTestRoutes);

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
          
          fs.writeFileSync(path.join(__dirname, 'tower_data_mapping.txt'), mappingText);
          console.log("Successfully generated tower_data_mapping.txt for academic verification!");
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
          }
        };
      }));

      // Broadcast to all connected clients
      socket.emit('telemetry_update', updates);
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
  // 1. Initialize DB (create it if missing)
  await initializeDatabase();
  
  // Note: Table creation / syncing is now handled by seed.js, not Sequelize
  
  // 3. Start Express
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

module.exports = { app, io };
