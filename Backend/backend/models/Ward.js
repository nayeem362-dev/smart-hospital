const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Ward = sequelize.define('Ward', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  wardNumber: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  wardName: { type: DataTypes.STRING(100), allowNull: false },
  type: {
    type: DataTypes.ENUM('cabin', 'ward', 'icu', 'emergency', 'general'),
    defaultValue: 'general',
  },
  totalBeds: { type: DataTypes.INTEGER, defaultValue: 1 },
  occupiedBeds: { type: DataTypes.INTEGER, defaultValue: 0 },
  chargePerDay: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  floor: { type: DataTypes.STRING(10), allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'wards',
  indexes: [
    { fields: ['wardNumber'] },
    { fields: ['type'] },
  ],
});

module.exports = Ward;