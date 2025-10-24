/**
 * Database Configuration for Sequelize (Render-ready)
 *
 * This setup supports both local (development) and Render (production)
 * PostgreSQL databases using environment variables.
 */

require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'admins',
    password: process.env.DB_PASSWORD || 'TS1PDLpaSYDnYFW6XlskssSPho4AV6J7',
    database: process.env.DB_NAME || 'creativehub_db',
    host: process.env.DB_HOST || 'dpg-d3tii4ili9vc73bdmia0-a',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: console.log,
  },

  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000,
    },
    logging: false,
  },
};
