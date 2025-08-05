const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PlanApplication = sequelize.define('PlanApplication', {
  application_id: {
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
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'declined', 'expired'),
    defaultValue: 'pending',
  },
  preferred_start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  payment_amount: {
    type: DataTypes.DECIMAL(10,2),
  },
  payment_date: {
    type: DataTypes.DATE,
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
  tableName: 'plan_applications',
  timestamps: false,
});

module.exports = PlanApplication; 