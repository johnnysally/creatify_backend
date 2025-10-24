const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Daraja will post B2C result to this endpoint (no auth)
router.post('/b2c/result', paymentController.mpesaB2cResult);

// Admin-only: trigger a B2C payout (manual)
router.post('/b2c/payout', authenticateToken, requireRole('admin', 'ceo'), paymentController.adminB2cPayout);

module.exports = router;
