const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Admission = sequelize.define('Admission', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  admissionId: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  patientId: { type: DataTypes.INTEGER, allowNull: false },
  wardId: { type: DataTypes.INTEGER, allowNull: false },
  doctorId: { type: DataTypes.INTEGER, allowNull: true },
  nurseId: { type: DataTypes.INTEGER, allowNull: true },
  bedNumber: { type: DataTypes.STRING(10), allowNull: true },
  admissionDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  dischargeDate: { type: DataTypes.DATE, allowNull: true },
  reason: { type: DataTypes.TEXT, allowNull: false },
  diagnosis: { type: DataTypes.TEXT, allowNull: true },
  treatment: { type: DataTypes.TEXT, allowNull: true },
  cabinCharges: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  medicineCharges: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  doctorCharges: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  nurseCharges: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  otherCharges: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  totalDays: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: {
    type: DataTypes.ENUM('admitted','under_observation','discharged','transferred'),
    defaultValue: 'admitted',
  },
  notes: { type: DataTypes.TEXT, allowNull: true },
  admittedBy: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'admissions',
  indexes: [
    { fields: ['admissionId'] },
    { fields: ['patientId'] },
    { fields: ['status'] },
  ],
});

module.exports = Admission;