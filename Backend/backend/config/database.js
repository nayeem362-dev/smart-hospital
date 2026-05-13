const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'smart_hospital_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    dialectOptions: process.env.DB_SSL === 'true' ? {
      ssl: { require: true, rejectUnauthorized: false }
    } : {},
    define: { timestamps: true, freezeTableName: false },
  }
);

const seedAdmin = async () => {
  try {
    const { User } = require('../models');
    const existing = await User.findOne({ where: { email: process.env.ADMIN_EMAIL || 'admin@hospital.com' } });
    if (!existing) {
      await User.create({
        name: 'Admin',
        email: process.env.ADMIN_EMAIL || 'admin@hospital.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@123456',
        role: 'admin',
        isActive: true,
      });
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  }
};

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Database connected successfully');
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized');
    await seedAdmin();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };