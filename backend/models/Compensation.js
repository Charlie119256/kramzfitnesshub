const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Compensation = sequelize.define('Compensation', {
  compensation_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  member_membership_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  compensation_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  reason: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  compensation_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  applied_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'applied', 'expired'),
    defaultValue: 'pending',
  },
  notes: {
    type: DataTypes.TEXT,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'compensations',
  timestamps: false,
});

module.exports = Compensation; 