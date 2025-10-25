// Simple DB connectivity tester using 'pg' client.
// Usage: set DATABASE_URL env var (or ensure .env.local exists) and run `node scripts/test-db-conn.js`

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Load .env.local if present
const dotenv = require('dotenv');
const localEnv = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(localEnv)) dotenv.config({ path: localEnv });

const DATABASE_URL = process.env.DATABASE_URL;

function maskDbUrl(u) {
  if (!u) return null;
  return u.replace(/(\/\/[^:]+:)([^@]+)@/, '$1*****@');
}

if (!DATABASE_URL) {
  console.error('No DATABASE_URL found in environment or .env.local');
  process.exit(2);
}

console.log('Testing DB connection to:', maskDbUrl(DATABASE_URL));

const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

client.connect()
  .then(() => client.query('SELECT NOW()'))
  .then((res) => {
    console.log('Connected OK — server time:', res.rows[0].now);
    return client.end();
  })
  .catch((err) => {
    console.error('Connection test failed:');
    console.error(err);
    process.exit(1);
  });
