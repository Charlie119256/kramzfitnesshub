const Member = require('../models/Member');
const MemberMembership = require('../models/MemberMembership');
const MembershipType = require('../models/MembershipType');
const Attendance = require('../models/Attendance');
const Announcement = require('../models/Announcement');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Get member's current membership plan
exports.getMembershipPlan = async (req, res) => {
  try {
    if (req.user.role !== 'member') {
      return res.status(403).json({ message: 'Access denied. Only members can access this feature.' });
    }

    const member = await Member.findOne({ where: { user_id: req.user.user_id } });
    if (!member) {
      return res.status(404).json({ message: 'Member profile not found.' });
    }

    const today = new Date();
    const activeMembership = await MemberMembership.findOne({
      where: {
        member_id: member.member_id,
        plan_status: 'active',
        start_date: { [Op.lte]: today },
        end_date: { [Op.gte]: today }
      },
      include: [{
        model: MembershipType,
        as: 'membershipType',
        attributes: ['name', 'description', 'duration_days', 'price']
      }],
      order: [['created_at', 'DESC']]
    });

    if (!activeMembership) {
      return res.status(404).json({ 
        message: 'No active membership found.',
        hasActiveMembership: false
      });
    }

    return res.status(200).json({
      hasActiveMembership: true,
      membership: activeMembership
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch membership plan.', error: error.message });
  }
};

// Get remaining days of membership plan
exports.getRemainingDays = async (req, res) => {
  try {
    if (req.user.role !== 'member') {
      return res.status(403).json({ message: 'Access denied. Only members can access this feature.' });
    }

    const member = await Member.findOne({ where: { user_id: req.user.user_id } });
    if (!member) {
      return res.status(404).json({ message: 'Member profile not found.' });
    }

    const today = new Date();
    const activeMembership = await MemberMembership.findOne({
      where: {
        member_id: member.member_id,
        plan_status: 'active',
        start_date: { [Op.lte]: today },
        end_date: { [Op.gte]: today }
      },
      include: [{
        model: MembershipType,
        as: 'membershipType',
        attributes: ['name', 'duration_days']
      }]
    });

    if (!activeMembership) {
      return res.status(404).json({ 
        message: 'No active membership found.',
        hasActiveMembership: false,
        remainingDays: 0
      });
    }

    const endDate = new Date(activeMembership.end_date);
    const remainingDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

    return res.status(200).json({
      hasActiveMembership: true,
      remainingDays: Math.max(0, remainingDays),
      totalDays: activeMembership.membershipType.duration_days,
      endDate: activeMembership.end_date,
      membershipName: activeMembership.membershipType.name
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch remaining days.', error: error.message });
  }
};

// Get total days of working out based on attendance
exports.getTotalWorkoutDays = async (req, res) => {
  try {
    if (req.user.role !== 'member') {
      return res.status(403).json({ message: 'Access denied. Only members can access this feature.' });
    }

    const member = await Member.findOne({ where: { user_id: req.user.user_id } });
    if (!member) {
      return res.status(404).json({ message: 'Member profile not found.' });
    }

    // Get total attendance count
    const totalWorkoutDays = await Attendance.count({
      where: { 
        member_id: member.member_id,
        status: 'present'
      }
    });

    // Get attendance by month for the current year
    const currentYear = new Date().getFullYear();
    const monthlyAttendance = await Attendance.findAll({
      where: {
        member_id: member.member_id,
        status: 'present',
        date: {
          [Op.gte]: new Date(currentYear, 0, 1),
          [Op.lt]: new Date(currentYear + 1, 0, 1)
        }
      },
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('date')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('attendance_id')), 'count']
      ],
      group: [sequelize.fn('MONTH', sequelize.col('date'))],
      order: [[sequelize.fn('MONTH', sequelize.col('date')), 'ASC']]
    });

    // Get recent attendance (last 10 sessions)
    const recentAttendance = await Attendance.findAll({
      where: { 
        member_id: member.member_id,
        status: 'present'
      },
      order: [['date', 'DESC']],
      limit: 10
    });

    return res.status(200).json({
      totalWorkoutDays,
      monthlyAttendance,
      recentAttendance,
      currentYear
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch workout statistics.', error: error.message });
  }
};

// Get attendance with date filtering
exports.getAttendanceWithFilter = async (req, res) => {
  try {
    if (req.user.role !== 'member') {
      return res.status(403).json({ message: 'Access denied. Only members can access this feature.' });
    }

    const member = await Member.findOne({ where: { user_id: req.user.user_id } });
    if (!member) {
      return res.status(404).json({ message: 'Member profile not found.' });
    }

    const { startDate, endDate, page = 1, limit = 20 } = req.query;
    let whereClause = { member_id: member.member_id };

    // Add date filtering if provided
    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [startDate, endDate]
      };
    } else if (startDate) {
      whereClause.date = {
        [Op.gte]: startDate
      };
    } else if (endDate) {
      whereClause.date = {
        [Op.lte]: endDate
      };
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Get attendance records with pagination
    const attendance = await Attendance.findAndCountAll({
      where: whereClause,
      include: [{
        model: MemberMembership,
        include: [{
          model: MembershipType,
          as: 'membershipType',
          attributes: ['name']
        }]
      }],
      order: [['date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Get attendance statistics for the filtered period
    const totalSessions = await Attendance.count({
      where: whereClause,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('attendance_id')), 'totalSessions'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('date'))), 'uniqueDays']
      ]
    });

    // Get average session duration
    const avgSessionDuration = await Attendance.findAll({
      where: {
        ...whereClause,
        time_in: { [Op.ne]: null },
        time_out: { [Op.ne]: null }
      },
      attributes: [
        [sequelize.fn('AVG', 
          sequelize.fn('TIMESTAMPDIFF', 
            sequelize.literal('MINUTE'), 
            sequelize.col('time_in'), 
            sequelize.col('time_out')
          )
        ), 'avgDuration']
      ]
    });

    return res.status(200).json({
      attendance: attendance.rows,
      pagination: {
        total: attendance.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(attendance.count / limit)
      },
      statistics: {
        totalSessions: attendance.count,
        uniqueDays: totalSessions,
        avgSessionDuration: avgSessionDuration[0]?.dataValues?.avgDuration || 0
      },
      filters: {
        startDate,
        endDate
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch attendance data.', error: error.message });
  }
};

// Get announcements for members
exports.getAnnouncements = async (req, res) => {
  try {
    if (req.user.role !== 'member') {
      return res.status(403).json({ message: 'Access denied. Only members can access this feature.' });
    }

    const announcements = await Announcement.findAll({
      where: {
        target_audience: ['all', 'members']
      },
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

// Get comprehensive member dashboard data
exports.getDashboardData = async (req, res) => {
  try {
    if (req.user.role !== 'member') {
      return res.status(403).json({ message: 'Access denied. Only members can access this feature.' });
    }

    let member = await Member.findOne({ where: { user_id: req.user.user_id } });
    
    if (!member) {
      // Try to find member by email as a fallback
      const User = require('../models/User');
      const user = await User.findByPk(req.user.user_id);
      if (user && user.email) {
        const memberByEmail = await Member.findOne({
          include: [{
            model: User,
            where: { email: user.email },
            attributes: []
          }]
        });
        
        if (memberByEmail) {
          member = memberByEmail;
        }
      }
    }
    
    if (!member) {
      return res.status(404).json({ 
        message: 'Member profile not found.',
        debug: {
          user_id: req.user.user_id,
          user_exists: true
        }
      });
    }

    const today = new Date();

    // Parallel execution for better performance
    const [
      activeMembership,
      totalWorkoutDays,
      recentAttendance,
      announcements
    ] = await Promise.all([
      // Get active membership
      MemberMembership.findOne({
        where: {
          member_id: member.member_id,
          plan_status: 'active',
          start_date: { [Op.lte]: today },
          end_date: { [Op.gte]: today }
        },
        include: [{
          model: MembershipType,
          as: 'membershipType',
          attributes: ['name', 'description', 'duration_days', 'price']
        }]
      }),
      // Get total workout days
      Attendance.count({
        where: { 
          member_id: member.member_id,
          status: 'present'
        }
      }),
      // Get recent attendance (last 5 sessions)
      Attendance.findAll({
        where: { 
          member_id: member.member_id,
          status: 'present'
        },
        order: [['date', 'DESC']],
        limit: 5
      }),
      // Get announcements
      Announcement.findAll({
        where: {
          target_audience: ['all', 'members']
        },
        order: [['created_at', 'DESC']],
        limit: 5
      })
    ]);

    // Calculate remaining days if membership exists
    let remainingDays = 0;
    let membershipName = null;
    let hasActiveMembership = false;

    if (activeMembership) {
      hasActiveMembership = true;
      const endDate = new Date(activeMembership.end_date);
      remainingDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
      membershipName = activeMembership.membershipType.name;
    }

    return res.status(200).json({
      hasActiveMembership,
      membership: activeMembership,
      remainingDays: Math.max(0, remainingDays),
      totalWorkoutDays,
      recentAttendance,
      announcements,
      memberInfo: {
        member_id: member.member_id,
        first_name: member.first_name,
        last_name: member.last_name,
        member_code: member.member_code
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch dashboard data.', error: error.message });
  }
};



// Get member's workout streak
exports.getWorkoutStreak = async (req, res) => {
  try {
    if (req.user.role !== 'member') {
      return res.status(403).json({ message: 'Access denied. Only members can access this feature.' });
    }

    const member = await Member.findOne({ where: { user_id: req.user.user_id } });
    if (!member) {
      return res.status(404).json({ message: 'Member profile not found.' });
    }

    const today = new Date();
    const attendanceDates = await Attendance.findAll({
      where: { 
        member_id: member.member_id,
        status: 'present'
      },
      attributes: ['date'],
      order: [['date', 'DESC']]
    });

    // Calculate current streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate = null;

    for (let i = 0; i < attendanceDates.length; i++) {
      const currentDate = new Date(attendanceDates[i].date);
      
      if (lastDate === null) {
        // First attendance
        tempStreak = 1;
        lastDate = currentDate;
      } else {
        const diffDays = Math.floor((lastDate - currentDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          // Consecutive day
          tempStreak++;
        } else {
          // Break in streak
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
          tempStreak = 1;
        }
        lastDate = currentDate;
      }
    }

    // Check if current streak is the longest
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }

    // Calculate current streak (consecutive days from today)
    const todayStr = today.toISOString().slice(0, 10);
    let checkDate = new Date();
    
    while (true) {
      const checkDateStr = checkDate.toISOString().slice(0, 10);
      const hasAttendance = attendanceDates.some(att => 
        att.date.toISOString().slice(0, 10) === checkDateStr
      );
      
      if (hasAttendance) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return res.status(200).json({
      currentStreak,
      longestStreak,
      totalWorkoutDays: attendanceDates.length
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch workout streak.', error: error.message });
  }
}; 

// Get member profile data for navbar
exports.getMemberProfile = async (req, res) => {
  try {
    if (req.user.role !== 'member') {
      return res.status(403).json({ message: 'Access denied. Only members can access this feature.' });
    }

    const member = await Member.findOne({ 
      where: { user_id: req.user.user_id },
      attributes: ['member_id', 'first_name', 'last_name', 'member_code']
    });

    if (!member) {
      return res.status(404).json({ message: 'Member profile not found.' });
    }

    return res.status(200).json({
      member_id: member.member_id,
      first_name: member.first_name,
      last_name: member.last_name,
      member_code: member.member_code,
      full_name: `${member.first_name} ${member.last_name}`
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch member profile.', error: error.message });
  }
};

// Get detailed member profile for profile page
exports.getDetailedMemberProfile = async (req, res) => {
  try {
    if (req.user.role !== 'member') {
      return res.status(403).json({ message: 'Access denied. Only members can access this feature.' });
    }

    const member = await Member.findOne({ 
      where: { user_id: req.user.user_id },
      attributes: [
        'member_id', 
        'first_name', 
        'last_name', 
        'middle_name',
        'suffix',
        'dob',
        'gender',
        'contact_number',
        'barangay',
        'municipality',
        'city',
        'profile_picture',
        'qr_code_path',
        'created_at'
      ]
    });

    if (!member) {
      return res.status(404).json({ message: 'Member profile not found.' });
    }

    // Get user email from users table
    const User = require('../models/User');
    const user = await User.findByPk(req.user.user_id, {
      attributes: ['email']
    });

    return res.status(200).json({
      member_id: member.member_id,
      first_name: member.first_name,
      last_name: member.last_name,
      middle_name: member.middle_name,
      suffix: member.suffix,
      dob: member.dob,
      gender: member.gender,
      contact_number: member.contact_number,
      barangay: member.barangay,
      municipality: member.municipality,
      city: member.city,
      profile_picture: member.profile_picture,
      qr_code_path: member.qr_code_path,
      email: user ? user.email : null,
      created_at: member.created_at,
      full_name: `${member.first_name} ${member.last_name}`
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch member profile.', error: error.message });
  }
}; 