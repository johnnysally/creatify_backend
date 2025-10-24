const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret';
const ACCESS_TOKEN_EXPIRES = process.env.JWT_EXPIRES || '1h';

function signToken(payload, expiresIn = ACCESS_TOKEN_EXPIRES) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function decodeToken(token) {
  return jwt.decode(token);
}

function generateAuthToken(user, opts = {}) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  return signToken(payload, opts.expiresIn || ACCESS_TOKEN_EXPIRES);
}

module.exports = {
  signToken,
  verifyToken,
  decodeToken,
  generateAuthToken,
};
