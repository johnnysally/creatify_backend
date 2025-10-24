const express = require('express');
const router = express.Router();
const settingsCtrl = require('../controllers/settings.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET public settings (readable by authenticated users)
router.get('/', authenticateToken, settingsCtrl.getSettings);

// PUT update settings (admin/ceo only)
router.put('/', authenticateToken, requireRole('admin', 'ceo'), settingsCtrl.updateSettings);

module.exports = router;
