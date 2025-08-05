const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EquipmentCategory = sequelize.define('EquipmentCategory', {
  category_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
}, {
  tableName: 'equipment_categories',
  timestamps: false,
});

module.exports = EquipmentCategory; 