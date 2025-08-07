const Receipt = require('../models/Receipt');
const MemberMembership = require('../models/MemberMembership');
const MembershipType = require('../models/MembershipType');
const Member = require('../models/Member');
const User = require('../models/User');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Get all earnings with detailed analytics
exports.getAllEarnings = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    const { startDate, endDate, membership_id, payment_method } = req.query;
    let whereClause = {};
    
    if (startDate && endDate) {
      whereClause.issued_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    if (payment_method) {
      whereClause.payment_method = payment_method;
    }

    const earnings = await Receipt.findAll({
      where: whereClause,
      include: [{
        model: MemberMembership,
        as: 'memberMembership',
        include: [
          {
            model: Member,
            as: 'member',
            include: [{
              model: User,
              as: 'user',
              attributes: ['email']
            }]
          },
          {
            model: MembershipType,
            as: 'membershipType',
            attributes: ['name', 'price', 'duration_days']
          }
        ]
      }],
      order: [['issued_at', 'DESC']]
    });

    return res.status(200).json(earnings);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch earnings data.', error: error.message });
  }
};

// Get earnings analytics and summary
exports.getEarningsAnalytics = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    const { startDate, endDate } = req.query;
    let whereClause = {};
    
    if (startDate && endDate) {
      whereClause.issued_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Get total earnings
    const totalEarnings = await Receipt.sum('amount', { where: whereClause }) || 0;

    // Get earnings by membership type
    const earningsByMembershipType = await Receipt.findAll({
      where: whereClause,
      include: [{
        model: MemberMembership,
        as: 'memberMembership',
        include: [{
          model: MembershipType,
          as: 'membershipType',
          attributes: ['name']
        }]
      }],
      attributes: [
        [sequelize.col('memberMembership.membershipType.name'), 'membership_name'],
        [sequelize.fn('SUM', sequelize.col('Receipt.amount')), 'total_amount'],
        [sequelize.fn('COUNT', sequelize.col('Receipt.receipt_id')), 'transaction_count']
      ],
      group: ['memberMembership.membershipType.name'],
      order: [[sequelize.fn('SUM', sequelize.col('Receipt.amount')), 'DESC']]
    });

    // Get monthly earnings
    const monthlyEarnings = await Receipt.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('issued_at')), 'month'],
        [sequelize.fn('YEAR', sequelize.col('issued_at')), 'year'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount'],
        [sequelize.fn('COUNT', sequelize.col('receipt_id')), 'transaction_count']
      ],
      group: [
        sequelize.fn('MONTH', sequelize.col('issued_at')),
        sequelize.fn('YEAR', sequelize.col('issued_at'))
      ],
      order: [
        [sequelize.fn('YEAR', sequelize.col('issued_at')), 'ASC'],
        [sequelize.fn('MONTH', sequelize.col('issued_at')), 'ASC']
      ]
    });

    // Get earnings by payment method
    const earningsByPaymentMethod = await Receipt.findAll({
      where: whereClause,
      attributes: [
        'payment_method',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount'],
        [sequelize.fn('COUNT', sequelize.col('receipt_id')), 'transaction_count']
      ],
      group: ['payment_method'],
      order: [[sequelize.fn('SUM', sequelize.col('amount')), 'DESC']]
    });

    // Get recent earnings
    const recentEarnings = await Receipt.findAll({
      where: whereClause,
      include: [{
        model: MemberMembership,
        as: 'memberMembership',
        include: [
          {
            model: Member,
            as: 'member',
            attributes: ['first_name', 'last_name']
          },
          {
            model: MembershipType,
            as: 'membershipType',
            attributes: ['name']
          }
        ]
      }],
      order: [['issued_at', 'DESC']],
      limit: 10
    });

    return res.status(200).json({
      totalEarnings,
      earningsByMembershipType,
      monthlyEarnings,
      earningsByPaymentMethod,
      recentEarnings
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch earnings analytics.', error: error.message });
  }
};

// Get earnings trends and year-over-year comparison
exports.getEarningsTrends = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const previousYear = currentYear - 1;

    // Get current year earnings by month
    const currentYearEarnings = await Receipt.findAll({
      where: {
        issued_at: {
          [Op.gte]: new Date(currentYear, 0, 1),
          [Op.lt]: new Date(currentYear + 1, 0, 1)
        }
      },
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('issued_at')), 'month'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount'],
        [sequelize.fn('COUNT', sequelize.col('receipt_id')), 'transaction_count']
      ],
      group: [sequelize.fn('MONTH', sequelize.col('issued_at'))],
      order: [[sequelize.fn('MONTH', sequelize.col('issued_at')), 'ASC']]
    });

    // Get previous year earnings by month
    const previousYearEarnings = await Receipt.findAll({
      where: {
        issued_at: {
          [Op.gte]: new Date(previousYear, 0, 1),
          [Op.lt]: new Date(previousYear + 1, 0, 1)
        }
      },
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('issued_at')), 'month'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount'],
        [sequelize.fn('COUNT', sequelize.col('receipt_id')), 'transaction_count']
      ],
      group: [sequelize.fn('MONTH', sequelize.col('issued_at'))],
      order: [[sequelize.fn('MONTH', sequelize.col('issued_at')), 'ASC']]
    });

    // Calculate totals
    const currentYearTotal = await Receipt.sum('amount', {
      where: {
        issued_at: {
          [Op.gte]: new Date(currentYear, 0, 1),
          [Op.lt]: new Date(currentYear + 1, 0, 1)
        }
      }
    }) || 0;

    const previousYearTotal = await Receipt.sum('amount', {
      where: {
        issued_at: {
          [Op.gte]: new Date(previousYear, 0, 1),
          [Op.lt]: new Date(previousYear + 1, 0, 1)
        }
      }
    }) || 0;

    const percentageChange = previousYearTotal > 0 
      ? ((currentYearTotal - previousYearTotal) / previousYearTotal) * 100 
      : 0;

    return res.status(200).json({
      currentYear,
      previousYear,
      currentYearEarnings,
      previousYearEarnings,
      currentYearTotal,
      previousYearTotal,
      percentageChange
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch earnings trends.', error: error.message });
  }
};

// Get earnings forecast based on historical data
exports.getEarningsForecast = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    const { months = 6 } = req.query;
    const forecastMonths = parseInt(months);

    // Get historical data for the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const historicalData = await Receipt.findAll({
      where: {
        issued_at: {
          [Op.gte]: twelveMonthsAgo
        }
      },
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('issued_at')), 'month'],
        [sequelize.fn('YEAR', sequelize.col('issued_at')), 'year'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount']
      ],
      group: [
        sequelize.fn('MONTH', sequelize.col('issued_at')),
        sequelize.fn('YEAR', sequelize.col('issued_at'))
      ],
      order: [
        [sequelize.fn('YEAR', sequelize.col('issued_at')), 'ASC'],
        [sequelize.fn('MONTH', sequelize.col('issued_at')), 'ASC']
      ]
    });

    // Calculate average monthly earnings
    const totalHistoricalEarnings = historicalData.reduce((sum, record) => sum + parseFloat(record.dataValues.total_amount), 0);
    const averageMonthlyEarnings = historicalData.length > 0 ? totalHistoricalEarnings / historicalData.length : 0;

    // Generate forecast
    const forecast = [];
    const currentDate = new Date();
    
    for (let i = 1; i <= forecastMonths; i++) {
      const forecastDate = new Date(currentDate);
      forecastDate.setMonth(currentDate.getMonth() + i);
      
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      
      forecast.push({
        month: forecastDate.getMonth() + 1,
        year: forecastDate.getFullYear(),
        monthName: `${monthNames[forecastDate.getMonth()]} ${forecastDate.getFullYear()}`,
        predictedAmount: averageMonthlyEarnings,
        confidence: 0.85 // 85% confidence level
      });
    }

    return res.status(200).json({
      historicalData,
      averageMonthlyEarnings,
      forecast,
      confidence: 0.85
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch earnings forecast.', error: error.message });
  }
};

// Get earnings details by receipt ID
exports.getEarningsDetails = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    const { receipt_id } = req.params;

    const receipt = await Receipt.findOne({
      where: { receipt_id },
      include: [{
        model: MemberMembership,
        as: 'memberMembership',
        include: [
          {
            model: Member,
            as: 'member',
            include: [{
              model: User,
              as: 'user',
              attributes: ['email']
            }]
          },
          {
            model: MembershipType,
            as: 'membershipType',
            attributes: ['name', 'price', 'duration_days', 'description']
          }
        ]
      }]
    });

    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found.' });
    }

    return res.status(200).json(receipt);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch earnings details.', error: error.message });
  }
}; 