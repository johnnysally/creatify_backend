// Debug: log the shape of the sequelize import if startup fails with 'Sequelize is not a constructor'
const SequelizePkg = require('sequelize');
// Uncomment the line below to inspect the package during startup (remove after debugging)
// console.log('sequelize pkg keys:', Object.keys(seqPkg));

// ✅ Handle Sequelize v7 (direct export) and v6 (named export)
const Sequelize = SequelizePkg.Sequelize ? SequelizePkg.Sequelize : SequelizePkg;
const config = require('../config/database.config');

const env = process.env.NODE_ENV || 'development';

const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    pool: dbConfig.pool,
    logging: dbConfig.logging,
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
// Determine DataTypes in a robust way and pass into models
const DataTypes = Sequelize.DataTypes || SequelizePkg.DataTypes || (require('sequelize').DataTypes);

// Import models (pass sequelize instance and DataTypes)
db.User = require('./User')(sequelize, DataTypes);
db.Approval = require('./Approval')(sequelize, DataTypes);
db.Payment = require('./Payment')(sequelize, DataTypes);
db.Transaction = require('./Transaction')(sequelize, DataTypes);
db.PayoutAccount = require('./PayoutAccount')(sequelize, DataTypes);

// Service model registration (was missing, causing db.Service to be undefined)
db.Service = require('./Service')(sequelize, DataTypes);
db.Order = require('./Order')(sequelize, DataTypes);

// Set up associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;