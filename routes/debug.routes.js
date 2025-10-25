const express = require('express');
const router = express.Router();
const db = require('../models');

// Simple DB probe: GET /api/_debug/db
// Enabled only when ENABLE_DB_DEBUG=true in env to avoid exposing in production unintentionally
router.get('/db', async (req, res) => {
  if (process.env.ENABLE_DB_DEBUG !== 'true') {
    return res.status(404).json({ error: 'Not found' });
  }

  try {
    const [results] = await db.sequelize.query("SELECT NOW() as now");
    const now = results && results[0] && results[0].now;
    return res.json({ ok: true, now });
  } catch (err) {
    console.error('DB debug query failed:', err && err.stack ? err.stack : err);
    return res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

module.exports = router;
