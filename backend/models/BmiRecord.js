const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BmiRecord = sequelize.define('BmiRecord', {
  bmi_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  member_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  height_cm: {
    type: DataTypes.DECIMAL(5,2),
    allowNull: false,
  },
  weight_kg: {
    type: DataTypes.DECIMAL(5,2),
    allowNull: false,
  },
  bmi_value: {
    type: DataTypes.DECIMAL(5,2),
    allowNull: false,
  },
  recorded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  notes: {
    type: DataTypes.STRING(255),
  },
}, {
  tableName: 'bmi_records',
  timestamps: false,
});

module.exports = BmiRecord; 