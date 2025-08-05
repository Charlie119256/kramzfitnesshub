const User = require('./User');
const Member = require('./Member');
const Clerk = require('./Clerk');
const MemberMembership = require('./MemberMembership');
const MembershipType = require('./MembershipType');
const Receipt = require('./Receipt');
const Equipment = require('./Equipment');
const EquipmentCategory = require('./EquipmentCategory');
const Attendance = require('./Attendance');
const Announcement = require('./Announcement');
const Notification = require('./Notification');
const BmiRecord = require('./BmiRecord');
const Workout = require('./Workout');
const WorkoutCategory = require('./WorkoutCategory');
const WeekPlan = require('./WeekPlan');
const Exercise = require('./Exercise');
const PlanApplication = require('./PlanApplication');

// User associations
User.hasOne(Member, { foreignKey: 'user_id', as: 'member' });
User.hasOne(Clerk, { foreignKey: 'user_id', as: 'clerk' });
User.hasMany(Announcement, { foreignKey: 'created_by', as: 'announcements' });

// Member associations
Member.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Member.hasMany(MemberMembership, { foreignKey: 'member_id', as: 'memberships' });
Member.hasMany(Attendance, { foreignKey: 'member_id', as: 'attendances' });
Member.hasMany(BmiRecord, { foreignKey: 'member_id', as: 'bmiRecords' });
Member.hasMany(PlanApplication, { foreignKey: 'member_id', as: 'applications' });

// Clerk associations
Clerk.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// MemberMembership associations
MemberMembership.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });
MemberMembership.belongsTo(MembershipType, { foreignKey: 'membership_id', as: 'membershipType' });
MemberMembership.hasMany(Receipt, { foreignKey: 'member_membership_id', as: 'receipts' });

// MembershipType associations
MembershipType.hasMany(MemberMembership, { foreignKey: 'membership_id', as: 'memberMemberships' });
MembershipType.hasMany(PlanApplication, { foreignKey: 'membership_id', as: 'applications' });

// Receipt associations
Receipt.belongsTo(MemberMembership, { foreignKey: 'member_membership_id', as: 'memberMembership' });

// Equipment associations
Equipment.belongsTo(EquipmentCategory, { foreignKey: 'category_id', as: 'category' });
EquipmentCategory.hasMany(Equipment, { foreignKey: 'category_id', as: 'equipment' });

// Attendance associations
Attendance.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });
Attendance.belongsTo(MemberMembership, { foreignKey: 'membership_id', as: 'membership' });

// Announcement associations
Announcement.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// BmiRecord associations
BmiRecord.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });

// Workout associations
Workout.belongsTo(WorkoutCategory, { foreignKey: 'category_id', as: 'category' });
WorkoutCategory.hasMany(Workout, { foreignKey: 'category_id', as: 'workouts' });

// WeekPlan associations
WeekPlan.belongsTo(Workout, { foreignKey: 'workout_id', as: 'workout' });

// Exercise associations
Exercise.belongsTo(Workout, { foreignKey: 'workout_id', as: 'workout' });

// PlanApplication associations
PlanApplication.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });
PlanApplication.belongsTo(MembershipType, { foreignKey: 'membership_id', as: 'membershipType' });

module.exports = {
  User,
  Member,
  Clerk,
  MemberMembership,
  MembershipType,
  Receipt,
  Equipment,
  EquipmentCategory,
  Attendance,
  Announcement,
  Notification,
  BmiRecord,
  Workout,
  WorkoutCategory,
  WeekPlan,
  Exercise,
  PlanApplication
}; 