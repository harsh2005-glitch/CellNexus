const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// GET all towers
router.get('/', async (req, res) => {
  try {
    const [towers] = await pool.query('SELECT * FROM Towers');
    res.json(towers);
  } catch (error) {
    console.error('Error fetching towers:', error);
    res.status(500).json({ error: 'Failed to fetch towers' });
  }
});

// GET single tower by ID
router.get('/:id', async (req, res) => {
  try {
    const [towers] = await pool.execute('SELECT * FROM Towers WHERE id = ?', [req.params.id]);
    if (towers.length === 0) return res.status(404).json({ error: 'Tower not found' });
    res.json(towers[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tower' });
  }
});

// GET telemetry for a specific tower
router.get('/:id/telemetry', async (req, res) => {
  try {
    const [telemetries] = await pool.execute(
      'SELECT * FROM Telemetries WHERE towerId = ? ORDER BY timestamp DESC LIMIT 20',
      [req.params.id]
    );
    // Return in chronological order for graphs
    res.json(telemetries.reverse());
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch telemetry' });
  }
});



module.exports = router;
