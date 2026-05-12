const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Bill = sequelize.define('Bill', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  billNumber: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  patientId: { type: DataTypes.INTEGER, allowNull: false },
  admissionId: { type: DataTypes.INTEGER, allowNull: true },
  emergencyCaseId: { type: DataTypes.INTEGER, allowNull: true },
  billType: {
    type: DataTypes.ENUM('admission','emergency','opd','diagnostic','consultation'),
    defaultValue: 'opd',
  },
  items: { type: DataTypes.JSON, allowNull: true },
  subtotal: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  discount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  tax: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  totalAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  paidAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  dueAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  status: {
    type: DataTypes.ENUM('pending','partial','paid','cancelled','refunded'),
    defaultValue: 'pending',
  },
  dueDate: { type: DataTypes.DATEONLY, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
  generatedBy: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'bills',
  indexes: [
    { fields: ['billNumber'] },
    { fields: ['patientId'] },
    { fields: ['status'] },
  ],
});

module.exports = Bill;