const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OPD = sequelize.define('OPD', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  opdId: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  patientId: { type: DataTypes.INTEGER, allowNull: false },
  doctorId: { type: DataTypes.INTEGER, allowNull: true },
  visitDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  chiefComplaint: { type: DataTypes.TEXT, allowNull: true },
  diagnosis: { type: DataTypes.TEXT, allowNull: true },
  prescription: { type: DataTypes.TEXT, allowNull: true },
  hasSurgery: { type: DataTypes.BOOLEAN, defaultValue: false },
  surgeryDetails: { type: DataTypes.TEXT, allowNull: true },
  surgeryCharges: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  otCharges: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  medicineCharges: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  equipmentCharges: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  consultationFee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  totalCharges: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  status: {
    type: DataTypes.ENUM('pending','in_progress','completed','cancelled'),
    defaultValue: 'pending',
  },
  billId: { type: DataTypes.INTEGER, allowNull: true },
  registeredBy: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'opd_records',
  indexes: [
    { fields: ['opdId'] },
    { fields: ['patientId'] },
  ],
});

module.exports = OPD;