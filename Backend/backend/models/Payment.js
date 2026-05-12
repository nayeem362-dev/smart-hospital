const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  paymentId: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  billId: { type: DataTypes.INTEGER, allowNull: false },
  patientId: { type: DataTypes.INTEGER, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  paymentMethod: {
    type: DataTypes.ENUM('cash','card','bank_transfer','mobile_banking','insurance'),
    defaultValue: 'cash',
  },
  transactionRef: { type: DataTypes.STRING(100), allowNull: true },
  status: {
    type: DataTypes.ENUM('pending','completed','failed','refunded'),
    defaultValue: 'completed',
  },
  notes: { type: DataTypes.TEXT, allowNull: true },
  receivedBy: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'payments',
  indexes: [
    { fields: ['paymentId'] },
    { fields: ['billId'] },
  ],
});

module.exports = Payment;