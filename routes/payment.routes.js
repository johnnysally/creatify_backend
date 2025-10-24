const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Initiate payment
router.post(
  '/initiate',
  authenticateToken,
  paymentController.initiateStkPush
);

// M-Pesa callback (no auth required)
router.post('/callback', paymentController.mpesaCallback);

// Query payment status
router.get(
  '/:paymentId/status',
  authenticateToken,
  paymentController.queryPaymentStatus
);

// Get commission stats (admin/ceo only)
router.get(
  '/commission/stats',
  authenticateToken,
  requireRole('admin', 'ceo'),
  paymentController.getCommissionStats
);

// Get creator earnings
router.get(
  '/earnings',
  authenticateToken,
  requireRole('creator'),
  paymentController.getCreatorEarnings
);

// Creator withdraw request
router.post(
  '/withdraw',
  authenticateToken,
  requireRole('creator'),
  paymentController.withdrawEarnings
);

// Get payout account
router.get(
  '/payout-account',
  authenticateToken,
  requireRole('creator'),
  paymentController.getPayoutAccount
);

// Save/update payout account
router.post(
  '/payout-account',
  authenticateToken,
  requireRole('creator'),
  paymentController.savePayoutAccount
);

// Get transaction history for current user
router.get(
  '/transactions',
  authenticateToken,
  requireRole('creator'),
  paymentController.getPayoutHistory
);

// Get exchange rate (USD -> KES) used for MPesa conversions
router.get('/exchange-rate', authenticateToken, requireRole('creator'), (req, res) => {
  const rate = Number(process.env.MPESA_EXCHANGE_RATE) || 150;
  res.json({ data: { rate } });
});

module.exports = router;
