const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const MembershipType = require('./MembershipType');

const MemberMembership = sequelize.define('MemberMembership', {
  member_membership_id: {
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
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  plan_status: {
    type: DataTypes.ENUM('pending', 'active', 'expired'),
    defaultValue: 'pending',
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
  tableName: 'member_memberships',
  timestamps: false,
});

MemberMembership.belongsTo(MembershipType, { foreignKey: 'membership_id', as: 'plan' });

module.exports = MemberMembership; 