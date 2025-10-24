const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Only allow IT support and CEO roles to view DB stats
router.get('/db-stats', authenticateToken, requireRole('it_support', 'ceo'), adminController.getDbStats);

// Change a user's password (admin action)
// Body: { newPassword: string }
// Allow 'admin' to reset passwords for creators and it_support; only 'ceo' can reset another CEO's password (enforced in controller)
router.put('/users/:userId/password', authenticateToken, requireRole('it_support', 'ceo', 'admin'), adminController.changeUserPassword);

module.exports = router;
