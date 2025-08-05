const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Exercise = sequelize.define('Exercise', {
  exercise_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  week_plan_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  day: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  sets: {
    type: DataTypes.INTEGER,
  },
  reps_time: {
    type: DataTypes.STRING(50),
  },
  rest_time: {
    type: DataTypes.STRING(50),
  },
  description: {
    type: DataTypes.STRING(255),
  },
}, {
  tableName: 'exercises',
  timestamps: false,
});

module.exports = Exercise; 