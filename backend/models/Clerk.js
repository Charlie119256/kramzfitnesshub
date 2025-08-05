const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Clerk = sequelize.define('Clerk', {
  clerk_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  middle_name: {
    type: DataTypes.STRING,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  suffix: {
    type: DataTypes.STRING,
  },
  dob: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false,
  },
  contact_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  barangay: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  municipality: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'clerks',
  timestamps: false,
});

module.exports = Clerk; 