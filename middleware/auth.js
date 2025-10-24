const { verifyToken } = require('../utils/jwt');
const db = require('../models');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = verifyToken(token);
    const user = await db.User.findByPk(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(403).json({ error: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

const requireApproval = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role === 'ceo') {
    return next();
  }

  if (req.user.role === 'public') {
    return next();
  }

  if (!req.user.isApproved) {
    return res.status(403).json({ 
      error: 'Your account is pending approval',
      pendingApproval: true 
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  requireRole,
  requireApproval,
};
