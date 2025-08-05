const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkoutCategory = sequelize.define('WorkoutCategory', {
  category_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(255),
  },
}, {
  tableName: 'workout_categories',
  timestamps: false,
});

module.exports = WorkoutCategory; 