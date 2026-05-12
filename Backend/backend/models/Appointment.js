const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  appointmentId: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  patientId: { type: DataTypes.INTEGER, allowNull: false },
  doctorId: { type: DataTypes.INTEGER, allowNull: false },
  appointmentDate: { type: DataTypes.DATEONLY, allowNull: false },
  appointmentTime: { type: DataTypes.TIME, allowNull: false },
  type: {
    type: DataTypes.ENUM('consultation', 'follow_up', 'emergency', 'specialized'),
    defaultValue: 'consultation',
  },
  reason: { type: DataTypes.TEXT, allowNull: true },
  symptoms: { type: DataTypes.TEXT, allowNull: true },
  diagnosis: { type: DataTypes.TEXT, allowNull: true },
  prescription: { type: DataTypes.TEXT, allowNull: true },
  consultationFee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  status: {
    type: DataTypes.ENUM('scheduled','confirmed','in_progress','completed','cancelled','no_show'),
    defaultValue: 'scheduled',
  },
  notes: { type: DataTypes.TEXT, allowNull: true },
  bookedBy: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'appointments',
  indexes: [
    { fields: ['appointmentId'] },
    { fields: ['patientId'] },
    { fields: ['doctorId'] },
    { fields: ['appointmentDate'] },
  ],
});

module.exports = Appointment;