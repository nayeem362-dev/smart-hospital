const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Nurse = sequelize.define('Nurse', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  nurseId: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  department: { type: DataTypes.STRING(50), allowNull: true },
  shift: {
    type: DataTypes.ENUM('morning', 'evening', 'night'),
    defaultValue: 'morning',
  },
  wardId: { type: DataTypes.INTEGER, allowNull: true },
  qualification: { type: DataTypes.STRING(255), allowNull: true },
  isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'nurses',
});

module.exports = Nurse;