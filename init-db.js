/**
 * Database Initialization Script
 * Run this file to create tables and seed initial data
 */

const db = require('./models');

async function initializeDatabase() {
  try {
    console.log('🔄 Connecting to database...');
    
    // Test connection
    await db.sequelize.authenticate();
    console.log('✅ Database connection established');

    // Sync models (create tables)
    console.log('🔄 Creating tables...');
    await db.sequelize.sync({ force: false }); // Set to true to drop existing tables
    console.log('✅ Tables created successfully');

    // Seed categories from frontend if services table is empty
    try {
      const seed = require('./scripts/seed-categories');
      await seed();
    } catch (err) {
      console.warn('Could not run seed-categories script:', err.message || err);
    }

    // Create default CEO account if not exists
    const bcrypt = require('bcryptjs');
    const ceoExists = await db.User.findOne({ where: { role: 'ceo' } });
    
    if (!ceoExists) {
      console.log('🔄 Creating default CEO account...');
      const hashedPassword = await bcrypt.hash('ceo123', 10);
      await db.User.create({
        email: 'ceo@creativehub.com',
        password: hashedPassword,
        fullName: 'CEO Admin',
        role: 'ceo',
        isApproved: true,
      });
      console.log('✅ Default CEO account created');
      console.log('   Email: ceo@creativehub.com');
      console.log('   Password: ceo123');
    }

    console.log('✅ Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
