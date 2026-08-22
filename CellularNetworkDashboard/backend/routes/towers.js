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

// ─────────────────────────────────────────────
// POST /api/towers — Create a new tower
// ─────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const {
      radio = '4G',
      operatorName,
      mcc = 404,
      mnc = 0,
      longitude,
      latitude,
      coverageRadius = 1000,
      cid,
      locationName,
      status = 'GOOD'
    } = req.body;

    if (!operatorName || !longitude || !latitude || !locationName) {
      return res.status(400).json({ error: 'operatorName, longitude, latitude, and locationName are required' });
    }

    const generatedCid = cid || Math.floor(Math.random() * 9000000) + 1000000;

    const [result] = await pool.execute(
      `INSERT INTO Towers (radio, operatorName, mcc, mnc, longitude, latitude, coverageRadius, cid, locationName, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [radio, operatorName, mcc, mnc, parseFloat(longitude), parseFloat(latitude), parseInt(coverageRadius), generatedCid, locationName, status]
    );

    const [newTower] = await pool.execute('SELECT * FROM Towers WHERE id = ?', [result.insertId]);
    res.status(201).json(newTower[0]);
  } catch (error) {
    console.error('Error creating tower:', error);
    res.status(500).json({ error: 'Failed to create tower' });
  }
});

// ─────────────────────────────────────────────
// PUT /api/towers/:id — Update an existing tower
// ─────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const {
      radio,
      operatorName,
      mcc,
      mnc,
      longitude,
      latitude,
      coverageRadius,
      cid,
      locationName,
      status
    } = req.body;

    const [existing] = await pool.execute('SELECT * FROM Towers WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Tower not found' });

    const current = existing[0];

    await pool.execute(
      `UPDATE Towers
       SET radio=?, operatorName=?, mcc=?, mnc=?, longitude=?, latitude=?, coverageRadius=?, cid=?, locationName=?, status=?
       WHERE id=?`,
      [
        radio        ?? current.radio,
        operatorName ?? current.operatorName,
        mcc          ?? current.mcc,
        mnc          ?? current.mnc,
        longitude != null ? parseFloat(longitude) : current.longitude,
        latitude  != null ? parseFloat(latitude)  : current.latitude,
        coverageRadius != null ? parseInt(coverageRadius) : current.coverageRadius,
        cid          ?? current.cid,
        locationName ?? current.locationName,
        status       ?? current.status,
        req.params.id
      ]
    );

    const [updated] = await pool.execute('SELECT * FROM Towers WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating tower:', error);
    res.status(500).json({ error: 'Failed to update tower' });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/towers/:id — Delete a tower + its telemetry
// ─────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const [existing] = await pool.execute('SELECT * FROM Towers WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Tower not found' });

    // Delete child telemetry rows first to avoid FK constraint errors
    await pool.execute('DELETE FROM Telemetries WHERE towerId = ?', [req.params.id]);
    await pool.execute('DELETE FROM Towers WHERE id = ?', [req.params.id]);

    res.json({ message: `Tower #${req.params.id} (${existing[0].locationName}) deleted successfully`, id: req.params.id });
  } catch (error) {
    console.error('Error deleting tower:', error);
    res.status(500).json({ error: 'Failed to delete tower' });
  }
});

module.exports = router;
