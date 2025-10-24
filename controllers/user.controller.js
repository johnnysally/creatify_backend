const db = require('../models');
const { Op } = require('sequelize');

// Get all users by role (for CEO and Admin)
const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const requestingUserRole = req.user.role;

    if (requestingUserRole === 'ceo') {
      // CEO can see all roles
    } else if (requestingUserRole === 'admin') {
      if (!['creator', 'it_support'].includes(role)) {
        return res.status(403).json({ error: 'Admins can only view creators and IT support' });
      }
    } else {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const users = await db.User.findAll({
      where: { role },
      attributes: ['id', 'email', 'fullName', 'role', 'isApproved', 'isActive', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get active users count
const getActiveUsersCount = async (req, res) => {
  try {
    const requestingUserRole = req.user.role;

    let whereClause = { isActive: true, isApproved: true };

    if (requestingUserRole === 'admin') {
      whereClause.role = { [Op.in]: ['creator', 'it_support'] };
    }

    const counts = await db.User.findAll({
      where: whereClause,
      attributes: [
        'role',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      group: ['role'],
    });

    const result = {};
    counts.forEach(item => {
      result[item.role] = parseInt(item.get('count'));
    });

    res.json({ counts: result });
  } catch (error) {
    console.error('Error fetching user counts:', error);
    res.status(500).json({ error: 'Failed to fetch user counts' });
  }
};

// Suspend user account
const suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserRole = req.user.role;

    const targetUser = await db.User.findByPk(userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (targetUser.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot suspend your own account' });
    }

    if (requestingUserRole === 'ceo') {
      if (targetUser.role === 'ceo') {
        return res.status(403).json({ error: 'Cannot suspend another CEO' });
      }
    } else if (requestingUserRole === 'admin') {
      if (!['creator', 'it_support'].includes(targetUser.role)) {
        return res.status(403).json({ error: 'Admins can only suspend creators and IT support' });
      }
    } else {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    targetUser.isActive = false;
    await targetUser.save();

    res.json({ message: 'User suspended successfully', user: targetUser });
  } catch (error) {
    console.error('Error suspending user:', error);
    res.status(500).json({ error: 'Failed to suspend user' });
  }
};

// Activate user account
const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserRole = req.user.role;

    const targetUser = await db.User.findByPk(userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (requestingUserRole === 'ceo') {
      if (targetUser.role === 'ceo' && targetUser.id !== req.user.id) {
        return res.status(403).json({ error: 'Cannot modify another CEO' });
      }
    } else if (requestingUserRole === 'admin') {
      if (!['creator', 'it_support'].includes(targetUser.role)) {
        return res.status(403).json({ error: 'Admins can only activate creators and IT support' });
      }
    } else {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    targetUser.isActive = true;
    await targetUser.save();

    res.json({ message: 'User activated successfully', user: targetUser });
  } catch (error) {
    console.error('Error activating user:', error);
    res.status(500).json({ error: 'Failed to activate user' });
  }
};

// Delete user account
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserRole = req.user.role;

    const targetUser = await db.User.findByPk(userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (targetUser.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    if (requestingUserRole === 'ceo') {
      if (targetUser.role === 'ceo') {
        return res.status(403).json({ error: 'Cannot delete another CEO' });
      }
    } else if (requestingUserRole === 'admin') {
      if (!['creator', 'it_support'].includes(targetUser.role)) {
        return res.status(403).json({ error: 'Admins can only delete creators and IT support' });
      }
    } else {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    await targetUser.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

module.exports = {
  getUsersByRole,
  getActiveUsersCount,
  suspendUser,
  activateUser,
  deleteUser,
};
