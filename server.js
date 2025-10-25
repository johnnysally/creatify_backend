/**
 * CreativeHub Backend Server (Render-ready, PostgreSQL version)
 * - Uses Sequelize with Postgres
 * - Includes security, rate limiting, and flexible CORS
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables: prefer .env.local if present, else .env
const localEnv = path.join(__dirname, '.env.local');
if (fs.existsSync(localEnv)) {
  dotenv.config({ path: localEnv });
} else {
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 5000;

// --- Security Middleware ---
app.set('trust proxy', 1);
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// --- CORS Setup ---
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN,
  process.env.FRONTEND_ORIGIN_ADMIN,
  'http://localhost:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.log('❌ CORS blocked origin:', origin);
        return callback(new Error('CORS policy: This origin is not allowed'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- Health Check ---
app.get('/api/health', (req, res) =>
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
);

// --- Database Setup (PostgreSQL via Sequelize) ---
const { Sequelize } = require('sequelize');

const DB_URL = process.env.DATABASE_URL;

// Helper to mask credentials in a DATABASE_URL for safe logging
function maskDbUrl(u) {
  if (!u) return null;
  try {
    return u.replace(/(\/\/[^:]+:)([^@]+)@/, '$1*****@');
  } catch (e) {
    return '[masked]';
  }
}

// Log which DB connection string we're using (masked) to help debug connection errors
if (DB_URL) {
  console.log('Using DATABASE_URL:', maskDbUrl(DB_URL));
} else {
  console.log('Using DB host/port from env:', process.env.DB_HOST || 'no DB_HOST', process.env.DB_PORT || 'no DB_PORT');
}
const DB_CONFIG = {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false,
};

const sequelize = DB_URL
  ? new Sequelize(DB_URL, DB_CONFIG)
  : new Sequelize(
      process.env.DB_NAME || 'creativehub_db',
      process.env.DB_USER || 'admins',
      process.env.DB_PASSWORD || 'password',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        ...DB_CONFIG,
      }
    );

// --- Database Initialization ---
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Database connected successfully');

    const db = require('./models');
    db.sequelize = sequelize;

    await db.sequelize.sync({ alter: false });
    console.log('✅ Database synchronized');

    // --- Routes ---
    app.use('/api/auth', require('./routes/auth.routes'));
    app.use('/api/approvals', require('./routes/approval.routes'));
    app.use('/api/payments', require('./routes/payment.routes'));
    app.use('/api/mpesa', require('./routes/mpesa.routes'));
    app.use('/api/contact', require('./routes/contact.routes'));
    app.use('/api/settings', require('./routes/settings.routes'));
    app.use('/api/users', require('./routes/user.routes'));
    app.use('/api/services', require('./routes/service.routes'));
    app.use('/api/uploads', require('./routes/uploads.routes'));
    app.use('/api/admin', require('./routes/admin.routes'));
    app.use('/api/orders', require('./routes/order.routes'));

    // Optional debug endpoint to test DB connectivity from the running instance.
    // Enable by setting ENABLE_DB_DEBUG=true in your environment (Render dashboard or .env.local).
    if (process.env.ENABLE_DB_DEBUG === 'true') {
      try {
        app.use('/api/_debug', require('./routes/debug.routes'));
        console.log('DB debug endpoint enabled at /api/_debug/db');
      } catch (e) {
        console.warn('Could not mount debug route:', e && e.message ? e.message : e);
      }
    }

    // --- Serve Frontend ---
    const frontendDist = path.join(__dirname, '..', 'dist');
    if (fs.existsSync(frontendDist)) {
      app.use(express.static(frontendDist));
      app.get('*', (req, res) =>
        res.sendFile(path.join(frontendDist, 'index.html'))
      );
      console.log('Serving built frontend from', frontendDist);
    }

    // --- Start Server ---
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error('❌ Startup failed:', err.message || err);
    process.exit(1);
  }
})();

// --- Static Uploads Directory ---
try {
  const uploadsDir = path.join(__dirname, 'public', 'uploads');
  fs.mkdirSync(uploadsDir, { recursive: true });
  app.use('/uploads', express.static(uploadsDir));
} catch (err) {
  console.warn('Could not ensure uploads folder', err);
}

// --- Error Handling ---
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong', message: err.message });
});

module.exports = app;
