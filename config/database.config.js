/**
 * Database Configuration
 *
 * Configure your local database connection here.
 * Replace the placeholder values with your actual database credentials.
 */

module.exports = {
  development: {
    host: process.env.DB_HOST || 'dpg-d3tii4ili9vc73bdmia0-a',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'creativehub_db',
    username: process.env.DB_USER || 'admins',
    password: process.env.DB_PASSWORD || 'TS1PDLpaSYDnYFW6XlskssSPho4AV6J7',
    dialect: 'postgres', // or 'postgres', 'sqlite', 'mariadb', 'mssql'
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: console.log // Set to false in production
  },
  
  production: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dialect: 'postgres',
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000
    },
    logging: false
  }
};
