const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get users by role - CEO and Admin only
router.get(
  '/role/:role',
  authenticateToken,
  requireRole('ceo', 'admin'),
  userController.getUsersByRole
);

// Get active users count
router.get(
  '/counts',
  authenticateToken,
  requireRole('ceo', 'admin'),
  userController.getActiveUsersCount
);

// Suspend user
router.put(
  '/:userId/suspend',
  authenticateToken,
  requireRole('ceo', 'admin'),
  userController.suspendUser
);

// Activate user
router.put(
  '/:userId/activate',
  authenticateToken,
  requireRole('ceo', 'admin'),
  userController.activateUser
);

// Delete user
router.delete(
  '/:userId',
  authenticateToken,
  requireRole('ceo', 'admin'),
  userController.deleteUser
);

module.exports = router;
