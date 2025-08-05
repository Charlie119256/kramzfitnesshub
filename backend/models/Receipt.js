const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Receipt = sequelize.define('Receipt', {
  receipt_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  member_membership_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  issued_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  amount: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false,
  },
  payment_method: {
    type: DataTypes.ENUM('cash', 'gcash'),
    allowNull: false,
  },
  reference_number: {
    type: DataTypes.STRING(100),
  },
  receipt_url: {
    type: DataTypes.STRING(255),
  },
  details: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'receipts',
  timestamps: false,
});

module.exports = Receipt; 