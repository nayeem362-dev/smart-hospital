const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EmergencyCase = sequelize.define('EmergencyCase', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  caseNumber: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  patientId: { type: DataTypes.INTEGER, allowNull: false },
  doctorId: { type: DataTypes.INTEGER, allowNull: true },
  nurseId: { type: DataTypes.INTEGER, allowNull: true },
  severity: {
    type: DataTypes.ENUM('critical', 'serious', 'moderate', 'minor'),
    defaultValue: 'moderate',
  },
  chiefComplaint: { type: DataTypes.TEXT, allowNull: false },
  diagnosis: { type: DataTypes.TEXT, allowNull: true },
  treatment: { type: DataTypes.TEXT, allowNull: true },
  medicineCharges: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  doctorCharges: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  nurseCharges: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  totalCharges: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  status: {
    type: DataTypes.ENUM('active', 'stable', 'admitted', 'discharged', 'deceased'),
    defaultValue: 'active',
  },
  admittedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  resolvedAt: { type: DataTypes.DATE, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'emergency_cases',
  indexes: [
    { fields: ['caseNumber'] },
    { fields: ['status'] },
    { fields: ['patientId'] },
  ],
});

module.exports = EmergencyCase;