/*
 * CreativeHub Backend Server (moved copy)
 * This file mirrors the original server.js from artful-spark-plaza/backend
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables: prefer .env.local if present, then .env
const localEnv = path.join(__dirname, '.env.local');
if (fs.existsSync(localEnv)) {
  dotenv.config({ path: localEnv });
} else {
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);
app.use(helmet());
const limiter = rateLimit({ windowMs: 15*60*1000, max: 100, standardHeaders: true, legacyHeaders: false });
app.use(limiter);

// Support multiple allowed origins in FRONTEND_ORIGIN as comma-separated list
const rawOrigins = process.env.FRONTEND_ORIGIN || process.env.VITE_API_URL || 'http://localhost:5173';
const allowedOrigins = rawOrigins.split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS policy: This origin is not allowed'), false);
  }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

const mysql = require('mysql2/promise');
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = process.env.DB_PORT || 3306;
const DB_NAME = process.env.DB_NAME || 'creativehub_db';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'password';

async function ensureDatabase() {
  try {
    const connection = await mysql.createConnection({ host: DB_HOST, port: DB_PORT, user: DB_USER, password: DB_PASSWORD, multipleStatements: false });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.end();
    console.log('Ensured database exists:', DB_NAME);
  } catch (err) {
    console.error('Failed to ensure database exists', err.message || err);
    throw err;
  }
}

(async () => {
  try {
    await ensureDatabase();
    const db = require('./models');
    await db.sequelize.authenticate();
    console.log('Database connected');

    // Safety: if existing DB has an ENUM for users.role that doesn't include newer roles,
    // ALTER it to a VARCHAR(64) to avoid 'Data truncated' errors when inserting new role values.
    async function ensureRoleColumnIsString() {
      try {
        const query = `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = :db AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'`;
        const results = await db.sequelize.query(query, { replacements: { db: DB_NAME }, type: db.Sequelize.QueryTypes.SELECT });
        const row = Array.isArray(results) ? results[0] : results;
        if (row && row.COLUMN_TYPE && String(row.COLUMN_TYPE).toLowerCase().startsWith('enum')) {
          console.log('Detected ENUM role column in users table. Altering to VARCHAR(64) for compatibility.');
          await db.sequelize.query("ALTER TABLE `users` MODIFY `role` VARCHAR(64) NOT NULL DEFAULT 'public'", { raw: true });
          console.log('Role column altered to VARCHAR(64).');
        }
      } catch (err) {
        console.warn('Could not inspect/alter role column automatically:', err && err.message ? err.message : err);
      }
    }

    await ensureRoleColumnIsString();

    // Also ensure approvals.requestedRole is a string (not an ENUM) so new roles don't get truncated
    async function ensureApprovalsRequestedRoleIsString() {
      try {
        const q = `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = :db AND TABLE_NAME = 'approvals' AND COLUMN_NAME = 'requestedRole'`;
        const results = await db.sequelize.query(q, { replacements: { db: DB_NAME }, type: db.Sequelize.QueryTypes.SELECT });
        const row = Array.isArray(results) ? results[0] : results;
        if (row && row.COLUMN_TYPE && String(row.COLUMN_TYPE).toLowerCase().startsWith('enum')) {
          console.log('Detected ENUM requestedRole column in approvals table. Altering to VARCHAR(64) for compatibility.');
          await db.sequelize.query("ALTER TABLE `approvals` MODIFY `requestedRole` VARCHAR(64) NOT NULL", { raw: true });
          console.log('Approvals.requestedRole column altered to VARCHAR(64).');
        }
      } catch (err) {
        console.warn('Could not inspect/alter approvals.requestedRole automatically:', err && err.message ? err.message : err);
      }
    }

    await ensureApprovalsRequestedRoleIsString();

    await db.sequelize.sync({ alter: false });
    console.log('Database synchronized');

    const authRoutes = require('./routes/auth.routes');
    const approvalRoutes = require('./routes/approval.routes');
    const paymentRoutes = require('./routes/payment.routes');
    const mpesaRoutes = require('./routes/mpesa.routes');
    const contactRoutes = require('./routes/contact.routes');
    const settingsRoutes = require('./routes/settings.routes');
    const userRoutes = require('./routes/user.routes');
    const serviceRoutes = require('./routes/service.routes');
    const uploadRoutes = require('./routes/uploads.routes');
    const adminRoutes = require('./routes/admin.routes');
    const orderRoutes = require('./routes/order.routes');

    app.use('/api/auth', authRoutes);
    app.use('/api/approvals', approvalRoutes);
    app.use('/api/payments', paymentRoutes);
    app.use('/api/mpesa', mpesaRoutes);
    app.use('/api/contact', contactRoutes);
    app.use('/api/settings', settingsRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/services', serviceRoutes);
    app.use('/api/uploads', uploadRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/orders', orderRoutes);

    const frontendDist = path.join(__dirname, '..', 'dist');
    if (fs.existsSync(frontendDist)) {
      app.use(express.static(frontendDist));
      app.get('*', (req, res) => res.sendFile(path.join(frontendDist, 'index.html')));
      console.log('Serving built frontend from', frontendDist);
    }

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Startup failed:', err);
    process.exit(1);
  }
})();

try {
  const uploadsDir = path.join(__dirname, 'public', 'uploads');
  fs.mkdirSync(uploadsDir, { recursive: true });
  app.use('/uploads', express.static(uploadsDir));
} catch (err) {
  console.warn('Could not ensure uploads folder', err);
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong', message: err.message });
});

module.exports = app;
