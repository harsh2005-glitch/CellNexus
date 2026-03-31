const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { pool } = require('./config/db');

async function importCSVFromLaptop() {
  const csvData = [];
  const filepath = path.join(__dirname, 'CallStats.csv');

  console.log('Reading CallStats.csv file...');

  fs.createReadStream(filepath)
    .pipe(csv())
    .on('data', (row) => {
      csvData.push(row);
    })
    .on('end', async () => {
      console.log(`Successfully read ${csvData.length} rows. Pushing to Database...`);

      try {
        // Fetch valid tower IDs to map the stats realistically
        const [towers] = await pool.query('SELECT id FROM Towers');
        if (towers.length === 0) {
            console.error('❌ No towers found in the database. Please insert towers into database.sql first.');
            process.exit(1);
        }
        const towerIds = towers.map(t => t.id);

        // Clear the telemetries table so we don't have infinite duplicate rows on rerun
        await pool.query('TRUNCATE TABLE Telemetries');

        for (const row of csvData) {
          // Parse values from CSV headers (CallStats.csv)
          const incomingCalls = parseInt(row['Incoming Calls'], 10) || 0;
          const answeredCalls = parseInt(row['Answered Calls'], 10) || 0;
          const abandonedCalls = parseInt(row['Blocked Calls'] || row['Abandoned Calls'], 10) || 0;
          
          // Parse "Response Time " (e.g., "0:00:17") into total seconds for response time
          const speedStr = row['Response Time '] || row['Answer Speed (AVG)'] || '0:00:00';
          const speedParts = speedStr.split(':');
          let responseTimeSecs = 0;
          if (speedParts.length === 3) {
            responseTimeSecs = parseInt(speedParts[0], 10) * 3600 + parseInt(speedParts[1], 10) * 60 + parseInt(speedParts[2], 10);
          }
          
          // Pick a valid random tower ID
          const towerId = towerIds[Math.floor(Math.random() * towerIds.length)];

          await pool.execute(
            `INSERT INTO Telemetries (towerId, callTotal, callAccepted, latency) VALUES (?, ?, ?, ?)`,
            [towerId, incomingCalls, answeredCalls, responseTimeSecs]
          );
        }
        
        console.log('✅ All CallStats.csv data cleanly imported!');
        process.exit(0);
      } catch (error) {
        console.error('❌ Database Error:', error.message);
        process.exit(1);
      }
    });
}

importCSVFromLaptop();
