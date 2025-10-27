const bcrypt = require('bcryptjs');
const jwtUtils = require('../utils/jwt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const register = async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;

    // Validate input
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role: role || 'public',
        isApproved: role === 'public' || role === 'ceo',
      },
    });

    // If requesting special role, create approval request
    if (role && role !== 'public') {
      try {
        const approval = await prisma.approval.create({
          data: {
            userId: user.id,
            requestedRole: role,
            status: role === 'ceo' ? 'approved' : 'pending',
          },
        });
        console.log(`Approval record created for user=${user.email} role=${role} status=${approval.status}`);
      } catch (approvalErr) {
        // Approval creation may fail due to DB constraints (enum mismatch, FK issues); log and continue
        console.error('Approval creation failed (non-fatal):', approvalErr && approvalErr.stack ? approvalErr.stack : approvalErr);
      }
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
    // Log full stack for debugging
    console.error('Registration error:', error && error.stack ? error.stack : error);
    // Include a hint in the response to check server logs (do not leak internals)
    res.status(500).json({ error: 'Registration failed. Check server logs for details.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

  const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.isActive === false) {
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
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isApproved: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
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
