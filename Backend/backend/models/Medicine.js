const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Medicine = sequelize.define('Medicine', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  medicineCode: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  name: { type: DataTypes.STRING(100), allowNull: false },
  genericName: { type: DataTypes.STRING(100), allowNull: true },
  category: { type: DataTypes.STRING(50), allowNull: true },
  type: {
    type: DataTypes.ENUM('tablet','capsule','syrup','injection','cream','drops','other'),
    defaultValue: 'tablet',
  },
  unitPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  stockQuantity: { type: DataTypes.INTEGER, defaultValue: 0 },
  reorderLevel: { type: DataTypes.INTEGER, defaultValue: 10 },
  manufacturer: { type: DataTypes.STRING(100), allowNull: true },
  expiryDate: { type: DataTypes.DATEONLY, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'medicines',
  indexes: [
    { fields: ['medicineCode'] },
    { fields: ['name'] },
  ],
});

module.exports = Medicine;