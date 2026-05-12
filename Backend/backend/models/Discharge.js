const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Discharge = sequelize.define('Discharge', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  dischargeId: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  patientId: { type: DataTypes.INTEGER, allowNull: false },
  admissionId: { type: DataTypes.INTEGER, allowNull: false },
  billId: { type: DataTypes.INTEGER, allowNull: true },
  dischargeDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  dischargeType: {
    type: DataTypes.ENUM('recovered','referred','against_advice','deceased','transferred'),
    defaultValue: 'recovered',
  },
  dischargeSummary: { type: DataTypes.TEXT, allowNull: true },
  finalDiagnosis: { type: DataTypes.TEXT, allowNull: true },
  followUpDate: { type: DataTypes.DATEONLY, allowNull: true },
  followUpInstructions: { type: DataTypes.TEXT, allowNull: true },
  prescriptionAtDischarge: { type: DataTypes.TEXT, allowNull: true },
  condition: {
    type: DataTypes.ENUM('excellent','good','fair','poor','critical'),
    defaultValue: 'good',
  },
  dischargedBy: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'discharges',
  indexes: [
    { fields: ['dischargeId'] },
    { fields: ['patientId'] },
  ],
});

module.exports = Discharge;