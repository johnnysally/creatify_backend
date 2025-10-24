const bcrypt = require('bcryptjs');
const jwtUtils = require('../utils/jwt');
const db = require('../models');

const register = async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;

    // Validate input
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await db.User.create({
      email,
      password: hashedPassword,
      fullName,
      role: role || 'public',
      isApproved: role === 'public' || role === 'ceo', // Public and CEO auto-approved
    });

    // If requesting special role, create approval request
    if (role && role !== 'public') {
      const approval = await db.Approval.create({
        userId: user.id,
        requestedRole: role,
        status: role === 'ceo' ? 'approved' : 'pending',
      });
      console.log(`Approval record created for user=${user.email} role=${role} status=${approval.status}`);
    }

    const token = jwtUtils.signToken({ userId: user.id, email: user.email, role: user.role }, '7d');

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    const token = jwtUtils.signToken({ userId: user.id, email: user.email, role: user.role }, '7d');

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });

    res.json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
};
