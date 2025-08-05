const Member = require('../models/Member');
const MemberMembership = require('../models/MemberMembership');
const MembershipType = require('../models/MembershipType');
const User = require('../models/User');
const Clerk = require('../models/Clerk');
const Equipment = require('../models/Equipment');
const Receipt = require('../models/Receipt');
const Announcement = require('../models/Announcement');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Get total earnings based on membership payments
exports.getTotalEarnings = async (req, res) => {
  try {
    if (!['admin', 'clerk'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const totalEarnings = await Receipt.sum('amount');
    
    // Get earnings by month for the current year
    const currentYear = new Date().getFullYear();
    const monthlyEarnings = await Receipt.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('created_at')), 'month'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      where: {
        created_at: {
          [Op.gte]: new Date(currentYear, 0, 1),
          [Op.lt]: new Date(currentYear + 1, 0, 1)
        }
      },
      group: [sequelize.fn('MONTH', sequelize.col('created_at'))],
      order: [[sequelize.fn('MONTH', sequelize.col('created_at')), 'ASC']]
    });

    return res.status(200).json({
      totalEarnings: totalEarnings || 0,
      monthlyEarnings: monthlyEarnings
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch earnings data.', error: error.message });
  }
};

// Get total members with active membership
exports.getTotalMembersWithMembership = async (req, res) => {
  try {
    if (!['admin', 'clerk'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const today = new Date();
    const activeMemberships = await MemberMembership.count({
      where: {
        plan_status: 'active',
        start_date: { [Op.lte]: today },
        end_date: { [Op.gte]: today }
      }
    });

    return res.status(200).json({
      totalMembersWithMembership: activeMemberships
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch membership data.', error: error.message });
  }
};

// Get total member accounts
exports.getTotalMemberAccounts = async (req, res) => {
  try {
    if (!['admin', 'clerk'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const totalMembers = await Member.count();
    const activeMembers = await Member.count({
      include: [{
        model: User,
        where: { status: 'active' }
      }]
    });

    return res.status(200).json({
      totalMemberAccounts: totalMembers,
      activeMemberAccounts: activeMembers,
      inactiveMemberAccounts: totalMembers - activeMembers
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch member data.', error: error.message });
  }
};

// Get total staff including admin
exports.getTotalStaff = async (req, res) => {
  try {
    if (!['admin', 'clerk'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const totalClerks = await Clerk.count({
      include: [{
        model: User,
        where: { status: 'active' }
      }]
    });

    const totalAdmins = await User.count({
      where: { 
        role: 'admin',
        status: 'active'
      }
    });

    return res.status(200).json({
      totalStaff: totalClerks + totalAdmins,
      totalClerks: totalClerks,
      totalAdmins: totalAdmins
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch staff data.', error: error.message });
  }
};

// Get total equipment
exports.getTotalEquipment = async (req, res) => {
  try {
    if (!['admin', 'clerk'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const totalEquipment = await Equipment.count();
    const availableEquipment = await Equipment.count({
      where: { status: 'available' }
    });
    const maintenanceEquipment = await Equipment.count({
      where: { status: 'maintenance' }
    });

    return res.status(200).json({
      totalEquipment: totalEquipment,
      availableEquipment: availableEquipment,
      maintenanceEquipment: maintenanceEquipment,
      unavailableEquipment: totalEquipment - availableEquipment - maintenanceEquipment
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch equipment data.', error: error.message });
  }
};

// Get members expiring soon (within 30 days)
exports.getExpiringSoon = async (req, res) => {
  try {
    if (!['admin', 'clerk'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const expiringSoon = await MemberMembership.findAll({
      where: {
        plan_status: 'active',
        end_date: {
          [Op.between]: [today, thirtyDaysFromNow]
        }
      },
      include: [{
        model: Member,
        include: [{
          model: User,
          attributes: ['email']
        }]
      }, {
        model: MembershipType,
        attributes: ['name', 'duration_days']
      }],
      order: [['end_date', 'ASC']]
    });

    return res.status(200).json({
      expiringSoon: expiringSoon,
      count: expiringSoon.length
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch expiring memberships.', error: error.message });
  }
};

// Get expired members
exports.getExpiredMembers = async (req, res) => {
  try {
    if (!['admin', 'clerk'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const today = new Date();

    const expiredMemberships = await MemberMembership.findAll({
      where: {
        plan_status: 'active',
        end_date: {
          [Op.lt]: today
        }
      },
      include: [{
        model: Member,
        include: [{
          model: User,
          attributes: ['email']
        }]
      }, {
        model: MembershipType,
        attributes: ['name', 'duration_days']
      }],
      order: [['end_date', 'DESC']]
    });

    return res.status(200).json({
      expiredMembers: expiredMemberships,
      count: expiredMemberships.length
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch expired memberships.', error: error.message });
  }
};

// Get earnings and expenses report
exports.getEarningsAndExpensesReport = async (req, res) => {
  try {
    if (!['admin', 'clerk'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const { startDate, endDate } = req.query;
    let whereClause = {};
    
    if (startDate && endDate) {
      whereClause.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Get earnings (receipts)
    const earnings = await Receipt.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
    });

    // Get expenses (equipment purchases)
    const expenses = await Equipment.findAll({
      where: {
        ...whereClause,
        purchase_date: whereClause.created_at || {}
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('purchase_date')), 'date'],
        [sequelize.fn('SUM', sequelize.col('price')), 'total']
      ],
      group: [sequelize.fn('DATE', sequelize.col('purchase_date'))],
      order: [[sequelize.fn('DATE', sequelize.col('purchase_date')), 'ASC']]
    });

    // Calculate totals
    const totalEarnings = await Receipt.sum('amount', { where: whereClause }) || 0;
    const totalExpenses = await Equipment.sum('price', { 
      where: {
        purchase_date: whereClause.created_at || {}
      }
    }) || 0;

    return res.status(200).json({
      earnings: earnings,
      expenses: expenses,
      totalEarnings: totalEarnings,
      totalExpenses: totalExpenses,
      netProfit: totalEarnings - totalExpenses
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch earnings and expenses report.', error: error.message });
  }
};

// Get gym membership by gender
exports.getMembershipByGender = async (req, res) => {
  try {
    if (!['admin', 'clerk'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const today = new Date();
    
    const membershipByGender = await MemberMembership.findAll({
      where: {
        plan_status: 'active',
        start_date: { [Op.lte]: today },
        end_date: { [Op.gte]: today }
      },
      include: [{
        model: Member,
        attributes: ['gender']
      }],
      attributes: [
        [sequelize.col('Member.gender'), 'gender'],
        [sequelize.fn('COUNT', sequelize.col('MemberMembership.member_membership_id')), 'count']
      ],
      group: ['Member.gender']
    });

    // Get total active memberships
    const totalActiveMemberships = await MemberMembership.count({
      where: {
        plan_status: 'active',
        start_date: { [Op.lte]: today },
        end_date: { [Op.gte]: today }
      }
    });

    return res.status(200).json({
      membershipByGender: membershipByGender,
      totalActiveMemberships: totalActiveMemberships
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch membership by gender data.', error: error.message });
  }
};

// Get all announcements (read-only for clerks)
exports.getAnnouncements = async (req, res) => {
  try {
    if (!['admin', 'clerk'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const announcements = await Announcement.findAll({
      order: [['created_at', 'DESC']],
      limit: 10 // Get latest 10 announcements
    });

    return res.status(200).json({
      announcements: announcements,
      count: announcements.length
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch announcements.', error: error.message });
  }
};

// Get comprehensive dashboard data
exports.getDashboardData = async (req, res) => {
  try {
    if (!['admin', 'clerk'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // Parallel execution for better performance
    const [
      totalEarnings,
      activeMemberships,
      totalMembers,
      totalClerks,
      totalAdmins,
      totalEquipment,
      expiringSoon,
      expiredMemberships,
      membershipByGender,
      announcements
    ] = await Promise.all([
      Receipt.sum('amount'),
      MemberMembership.count({
        where: {
          plan_status: 'active',
          start_date: { [Op.lte]: today },
          end_date: { [Op.gte]: today }
        }
      }),
      Member.count(),
      Clerk.count({
        include: [{
          model: User,
          where: { status: 'active' }
        }]
      }),
      User.count({
        where: { 
          role: 'admin',
          status: 'active'
        }
      }),
      Equipment.count(),
      MemberMembership.count({
        where: {
          plan_status: 'active',
          end_date: {
            [Op.between]: [today, thirtyDaysFromNow]
          }
        }
      }),
      MemberMembership.count({
        where: {
          plan_status: 'active',
          end_date: {
            [Op.lt]: today
          }
        }
      }),
      MemberMembership.findAll({
        where: {
          plan_status: 'active',
          start_date: { [Op.lte]: today },
          end_date: { [Op.gte]: today }
        },
        include: [{
          model: Member,
          attributes: ['gender']
        }],
        attributes: [
          [sequelize.col('Member.gender'), 'gender'],
          [sequelize.fn('COUNT', sequelize.col('MemberMembership.member_membership_id')), 'count']
        ],
        group: ['Member.gender']
      }),
      Announcement.findAll({
        order: [['created_at', 'DESC']],
        limit: 5
      })
    ]);

    return res.status(200).json({
      totalEarnings: totalEarnings || 0,
      totalMembersWithMembership: activeMemberships,
      totalMemberAccounts: totalMembers,
      totalStaff: totalClerks + totalAdmins,
      totalEquipment: totalEquipment,
      expiringSoon: expiringSoon,
      expiredMembers: expiredMemberships,
      membershipByGender: membershipByGender,
      recentAnnouncements: announcements
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch dashboard data.', error: error.message });
  }
}; 