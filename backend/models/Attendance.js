const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
  attendance_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  member_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  membership_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  time_in: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  time_out: {
    type: DataTypes.DATE,
  },
  status: {
    type: DataTypes.ENUM('present', 'invalid', 'expired'),
    defaultValue: 'present',
  },
  remarks: {
    type: DataTypes.STRING(255),
  },
}, {
  tableName: 'attendance',
  timestamps: false,
});

module.exports = Attendance; 