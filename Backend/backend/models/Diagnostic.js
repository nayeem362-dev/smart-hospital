const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Diagnostic = sequelize.define('Diagnostic', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  testId: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  patientId: { type: DataTypes.INTEGER, allowNull: false },
  orderedBy: { type: DataTypes.INTEGER, allowNull: true },
  conductedBy: { type: DataTypes.INTEGER, allowNull: true },
  testType: {
    type: DataTypes.ENUM('xray','blood_test','urine_test','mri','ct_scan','ultrasound','ecg','other'),
    allowNull: false,
  },
  testName: { type: DataTypes.STRING(100), allowNull: false },
  testDetails: { type: DataTypes.TEXT, allowNull: true },
  result: { type: DataTypes.TEXT, allowNull: true },
  reportFile: { type: DataTypes.STRING(255), allowNull: true },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'pending',
  },
  charges: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  isPaid: { type: DataTypes.BOOLEAN, defaultValue: false },
  scheduledAt: { type: DataTypes.DATE, allowNull: true },
  completedAt: { type: DataTypes.DATE, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'diagnostics',
  indexes: [
    { fields: ['testId'] },
    { fields: ['patientId'] },
    { fields: ['testType'] },
    { fields: ['status'] },
  ],
});

module.exports = Diagnostic;