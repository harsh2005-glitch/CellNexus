const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// POST a new speed test result (Simulator posts here)
router.post('/', async (req, res) => {
  try {
    const { downloadSpeedMbps, uploadSpeedMbps, latencyMs } = req.body;
    
    // We expect the frontend/module to provide properties named downloadSpeed, uploadSpeed, latency
    // Let's grab them safely, parsing to float
    const down = parseFloat(downloadSpeedMbps || req.body.downloadSpeed);
    const up = parseFloat(uploadSpeedMbps || req.body.uploadSpeed);
    const lat = parseInt(latencyMs || req.body.latency, 10);

    const [result] = await pool.execute(
      'INSERT INTO SpeedTests (downloadSpeed, uploadSpeed, latency, timestamp) VALUES (?, ?, ?, NOW())',
      [down, up, lat]
    );
    
    res.status(201).json({ id: result.insertId, downloadSpeed: down, uploadSpeed: up, latency: lat });
  } catch (error) {
    console.error('Speed Test Error:', error);
    res.status(500).json({ error: 'Failed to save speed test' });
  }
});

// GET /ping - Used to test latency
router.get('/ping', (req, res) => {
  res.json({ pong: true });
});

// GET /download - Serves a raw buffer to test download speed
router.get('/download', (req, res) => {
  const size = parseInt(req.query.size) || 20 * 1024 * 1024; // Default 20MB
  const dummyData = Buffer.alloc(size, '0');
  
  // Set headers so the browser can track progress and avoid caching
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Length', size);
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  
  res.send(dummyData);
});

// POST /upload - Accepts a raw buffer to test upload speed
router.post('/upload', (req, res) => {
  const size = req.body ? req.body.length : 0;
  res.json({ success: true, receivedBytes: size });
});

// GET recent speed tests
router.get('/', async (req, res) => {
  try {
    const [tests] = await pool.query('SELECT * FROM SpeedTests ORDER BY timestamp DESC LIMIT 10');
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch speed tests' });
  }
});

module.exports = router;
