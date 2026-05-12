const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Patient = sequelize.define('Patient', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  patientId: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  age: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  gender: { type: DataTypes.ENUM('male', 'female', 'other'), allowNull: false, defaultValue: 'male' },
  bloodGroup: { type: DataTypes.STRING(5), allowNull: true },
  phone: { type: DataTypes.STRING(20), allowNull: false, defaultValue: '' },
  email: { type: DataTypes.STRING(150), allowNull: true },
  address: { type: DataTypes.TEXT, allowNull: true },
  emergencyContact: { type: DataTypes.STRING(100), allowNull: true },
  emergencyPhone: { type: DataTypes.STRING(20), allowNull: true },
  medicalHistory: { type: DataTypes.TEXT, allowNull: true },
  allergies: { type: DataTypes.TEXT, allowNull: true },
  status: {
    type: DataTypes.ENUM('active', 'admitted', 'discharged', 'emergency'),
    defaultValue: 'active',
  },
  registeredBy: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'patients',
  indexes: [
    { fields: ['patientId'] },
    { fields: ['phone'] },
    { fields: ['status'] },
  ],
});

module.exports = Patient;