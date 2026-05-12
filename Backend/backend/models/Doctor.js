const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Doctor = sequelize.define('Doctor', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  doctorId: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  specialization: { type: DataTypes.STRING(100), allowNull: false },
  department: {
    type: DataTypes.ENUM('emergency','cardiology','neurology','orthopedics','pediatrics','gynecology','surgery','opd','diagnostic','general'),
    allowNull: false,
    defaultValue: 'general',
  },
  qualification: { type: DataTypes.STRING(255), allowNull: true },
  experience: { type: DataTypes.INTEGER, defaultValue: 0 },
  consultationFee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  availableDays: { type: DataTypes.JSON, allowNull: true },
  availableHours: { type: DataTypes.JSON, allowNull: true },
  bio: { type: DataTypes.TEXT, allowNull: true },
  isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'doctors',
  indexes: [
    { fields: ['doctorId'] },
    { fields: ['department'] },
  ],
});

module.exports = Doctor;