const Member = require('../models/Member');
const MemberMembership = require('../models/MemberMembership');
const MembershipType = require('../models/MembershipType');
const User = require('../models/User');
const Compensation = require('../models/Compensation');
const Attendance = require('../models/Attendance');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Get all members with active membership plans
exports.getAllMembers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    const { search, status, membership_type } = req.query;
    const today = new Date();

    let whereClause = {
      plan_status: 'active',
      start_date: { [Op.lte]: today },
      end_date: { [Op.gte]: today }
    };

    if (membership_type) {
      whereClause.membership_id = membership_type;
    }

    const members = await MemberMembership.findAll({
      where: whereClause,
      include: [
        {
          model: Member,
          as: 'member',
          include: [{
            model: User,
            as: 'user',
            attributes: ['email', 'status']
          }]
        },
        {
          model: MembershipType,
          as: 'membershipType',
          attributes: ['name', 'price', 'duration_days', 'description']
        },
        {
          model: Compensation,
          as: 'compensations',
          where: { status: 'applied' },
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Filter by search term if provided
    let filteredMembers = members;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredMembers = members.filter(membership => {
        const member = membership.member;
        const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
        const email = member.user.email.toLowerCase();
        return fullName.includes(searchLower) || email.includes(searchLower);
      });
    }

    // Calculate remaining days and compensation info for each member
    const membersWithDetails = filteredMembers.map(membership => {
      const endDate = new Date(membership.end_date);
      const remainingDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
      
      // Calculate total compensation days
      const totalCompensationDays = membership.compensations.reduce((sum, comp) => sum + comp.compensation_days, 0);
      
      return {
        ...membership.toJSON(),
        remainingDays: Math.max(0, remainingDays),
        totalCompensationDays,
        effectiveEndDate: new Date(endDate.getTime() + (totalCompensationDays * 24 * 60 * 60 * 1000))
      };
    });

    return res.status(200).json(membersWithDetails);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch members data.', error: error.message });
  }
};

// Get member details with full information
exports.getMemberDetails = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    const { member_membership_id } = req.params;

    const memberMembership = await MemberMembership.findOne({
      where: { member_membership_id },
      include: [
        {
          model: Member,
          as: 'member',
          include: [{
            model: User,
            as: 'user',
            attributes: ['email', 'status']
          }]
        },
        {
          model: MembershipType,
          as: 'membershipType',
          attributes: ['name', 'price', 'duration_days', 'description']
        },
        {
          model: Compensation,
          as: 'compensations',
          include: [{
            model: User,
            as: 'appliedBy',
            attributes: ['email']
          }],
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!memberMembership) {
      return res.status(404).json({ message: 'Member membership not found.' });
    }

    // Get attendance data
    const attendance = await Attendance.findAll({
      where: { member_id: memberMembership.member_id },
      order: [['date', 'DESC']],
      limit: 10
    });

    // Calculate statistics
    const today = new Date();
    const endDate = new Date(memberMembership.end_date);
    const remainingDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    const totalCompensationDays = memberMembership.compensations
      .filter(comp => comp.status === 'applied')
      .reduce((sum, comp) => sum + comp.compensation_days, 0);

    const memberDetails = {
      ...memberMembership.toJSON(),
      remainingDays: Math.max(0, remainingDays),
      totalCompensationDays,
      effectiveEndDate: new Date(endDate.getTime() + (totalCompensationDays * 24 * 60 * 60 * 1000)),
      attendance
    };

    return res.status(200).json(memberDetails);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch member details.', error: error.message });
  }
};

// Add compensation days for a member
exports.addCompensation = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    const { member_membership_id } = req.params;
    const { compensation_days, reason, compensation_date, notes } = req.body;

    if (!compensation_days || !reason || !compensation_date) {
      return res.status(400).json({ message: 'Compensation days, reason, and date are required.' });
    }

    // Verify member membership exists and is active
    const memberMembership = await MemberMembership.findOne({
      where: { 
        member_membership_id,
        plan_status: 'active'
      }
    });

    if (!memberMembership) {
      return res.status(404).json({ message: 'Active member membership not found.' });
    }

    // Create compensation record
    const compensation = await Compensation.create({
      member_membership_id,
      compensation_days: parseInt(compensation_days),
      reason,
      compensation_date,
      applied_by: req.user.user_id,
      status: 'applied',
      notes
    });

    return res.status(201).json({ 
      message: 'Compensation added successfully.',
      compensation
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add compensation.', error: error.message });
  }
};

// Update member membership end date (extend membership)
exports.extendMembership = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    const { member_membership_id } = req.params;
    const { extension_days, reason } = req.body;

    if (!extension_days || extension_days <= 0) {
      return res.status(400).json({ message: 'Valid extension days are required.' });
    }

    // Get current membership
    const memberMembership = await MemberMembership.findOne({
      where: { member_membership_id }
    });

    if (!memberMembership) {
      return res.status(404).json({ message: 'Member membership not found.' });
    }

    // Calculate new end date
    const currentEndDate = new Date(memberMembership.end_date);
    const newEndDate = new Date(currentEndDate.getTime() + (extension_days * 24 * 60 * 60 * 1000));

    // Update membership end date
    await memberMembership.update({
      end_date: newEndDate
    });

    // Create compensation record for tracking
    await Compensation.create({
      member_membership_id,
      compensation_days: extension_days,
      reason: reason || 'Membership extension',
      compensation_date: new Date(),
      applied_by: req.user.user_id,
      status: 'applied',
      notes: `Membership extended by ${extension_days} days`
    });

    return res.status(200).json({ 
      message: 'Membership extended successfully.',
      newEndDate: newEndDate
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to extend membership.', error: error.message });
  }
};

// Get compensation history for a member
exports.getCompensationHistory = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    const { member_membership_id } = req.params;

    const compensations = await Compensation.findAll({
      where: { member_membership_id },
      include: [{
        model: User,
        as: 'appliedBy',
        attributes: ['email']
      }],
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json(compensations);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch compensation history.', error: error.message });
  }
};

// Get members statistics
exports.getMembersStatistics = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // Get statistics
    const [
      totalActiveMembers,
      expiringSoon,
      totalCompensations,
      membersByMembershipType
    ] = await Promise.all([
      // Total active members
      MemberMembership.count({
        where: {
          plan_status: 'active',
          start_date: { [Op.lte]: today },
          end_date: { [Op.gte]: today }
        }
      }),
      // Members expiring soon
      MemberMembership.count({
        where: {
          plan_status: 'active',
          end_date: {
            [Op.between]: [today, thirtyDaysFromNow]
          }
        }
      }),
      // Total compensations applied
      Compensation.count({
        where: { status: 'applied' }
      }),
      // Members by membership type
      MemberMembership.findAll({
        where: {
          plan_status: 'active',
          start_date: { [Op.lte]: today },
          end_date: { [Op.gte]: today }
        },
        include: [{
          model: MembershipType,
          as: 'membershipType',
          attributes: ['name']
        }],
        attributes: [
          [sequelize.col('membershipType.name'), 'membership_name'],
          [sequelize.fn('COUNT', sequelize.col('MemberMembership.member_membership_id')), 'count']
        ],
        group: ['membershipType.name'],
        order: [[sequelize.fn('COUNT', sequelize.col('MemberMembership.member_membership_id')), 'DESC']]
      })
    ]);

    return res.status(200).json({
      totalActiveMembers,
      expiringSoon,
      totalCompensations,
      membersByMembershipType
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch members statistics.', error: error.message });
  }
};

// Bulk add compensation for multiple members
exports.bulkAddCompensation = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    const { member_membership_ids, compensation_days, reason, compensation_date, notes } = req.body;

    if (!member_membership_ids || !Array.isArray(member_membership_ids) || member_membership_ids.length === 0) {
      return res.status(400).json({ message: 'Valid member membership IDs are required.' });
    }

    if (!compensation_days || !reason || !compensation_date) {
      return res.status(400).json({ message: 'Compensation days, reason, and date are required.' });
    }

    // Verify all memberships exist and are active
    const memberMemberships = await MemberMembership.findAll({
      where: { 
        member_membership_id: member_membership_ids,
        plan_status: 'active'
      }
    });

    if (memberMemberships.length !== member_membership_ids.length) {
      return res.status(400).json({ message: 'Some member memberships not found or inactive.' });
    }

    // Create compensation records for all members
    const compensations = [];
    for (const membership of memberMemberships) {
      const compensation = await Compensation.create({
        member_membership_id: membership.member_membership_id,
        compensation_days: parseInt(compensation_days),
        reason,
        compensation_date,
        applied_by: req.user.user_id,
        status: 'applied',
        notes
      });
      compensations.push(compensation);
    }

    return res.status(201).json({ 
      message: `Compensation added successfully for ${compensations.length} members.`,
      compensations
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add bulk compensation.', error: error.message });
  }
}; 