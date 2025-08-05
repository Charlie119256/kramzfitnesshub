const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WeekPlan = sequelize.define('WeekPlan', {
  week_plan_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  workout_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  week_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(255),
  },
}, {
  tableName: 'week_plans',
  timestamps: false,
});

module.exports = WeekPlan; 