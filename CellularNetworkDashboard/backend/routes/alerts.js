const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// ─── Ensure Alerts table exists ───────────────────────────────────────────────
async function ensureAlertsTable() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS \`Alerts\` (
      \`id\`          INT AUTO_INCREMENT PRIMARY KEY,
      \`towerId\`     INT NOT NULL,
      \`towerName\`   VARCHAR(255),
      \`type\`        ENUM('TOWER_OFFLINE','SIGNAL_DEGRADED','HIGH_CALL_DROP','LATENCY_SPIKE') NOT NULL,
      \`severity\`    ENUM('CRITICAL','WARNING','INFO') NOT NULL DEFAULT 'INFO',
      \`message\`     TEXT,
      \`status\`      ENUM('ACTIVE','ACKNOWLEDGED','RESOLVED') NOT NULL DEFAULT 'ACTIVE',
      \`timestamp\`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`resolvedAt\`  TIMESTAMP NULL,
      \`acknowledgedAt\` TIMESTAMP NULL
    )
  `);
}
ensureAlertsTable().catch(console.error);

// ─── GET /api/alerts  — list all alerts (newest first) ───────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Alerts ORDER BY timestamp DESC LIMIT 200'
    );
    res.json(rows);
  } catch (err) {
    console.error('Alerts fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// ─── POST /api/alerts  — create a new alert manually ─────────────────────────
router.post('/', async (req, res) => {
  const { towerId, towerName, type, severity, message } = req.body;
  if (!towerId || !type || !severity) {
    return res.status(400).json({ error: 'towerId, type, and severity are required' });
  }
  try {
    const [result] = await pool.execute(
      `INSERT INTO Alerts (towerId, towerName, type, severity, message, status, timestamp)
       VALUES (?, ?, ?, ?, ?, 'ACTIVE', NOW())`,
      [towerId, towerName || null, type, severity, message || null]
    );
    const [rows] = await pool.query('SELECT * FROM Alerts WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Alert create error:', err);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// ─── PATCH /api/alerts/:id/acknowledge ───────────────────────────────────────
router.patch('/:id/acknowledge', async (req, res) => {
  try {
    await pool.execute(
      `UPDATE Alerts SET status = 'ACKNOWLEDGED', acknowledgedAt = NOW()
       WHERE id = ? AND status = 'ACTIVE'`,
      [req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM Alerts WHERE id = ?', [req.params.id]);
    res.json(rows[0] || { error: 'Not found' });
  } catch (err) {
    console.error('Acknowledge error:', err);
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

// ─── PATCH /api/alerts/:id/resolve ───────────────────────────────────────────
router.patch('/:id/resolve', async (req, res) => {
  try {
    await pool.execute(
      `UPDATE Alerts SET status = 'RESOLVED', resolvedAt = NOW()
       WHERE id = ? AND status != 'RESOLVED'`,
      [req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM Alerts WHERE id = ?', [req.params.id]);
    res.json(rows[0] || { error: 'Not found' });
  } catch (err) {
    console.error('Resolve error:', err);
    res.status(500).json({ error: 'Failed to resolve alert' });
  }
});

// ─── DELETE /api/alerts/:id ───────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM Alerts WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

module.exports = router;
