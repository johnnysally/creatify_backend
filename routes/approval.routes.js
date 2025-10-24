const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approval.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get(
  '/pending',
  authenticateToken,
  requireRole('ceo', 'admin'),
  approvalController.getPendingApprovals
);

router.post(
  '/:approvalId/approve',
  authenticateToken,
  requireRole('ceo', 'admin'),
  approvalController.approveUser
);

router.get(
  '/my-status',
  authenticateToken,
  approvalController.getMyApprovalStatus
);

module.exports = router;
