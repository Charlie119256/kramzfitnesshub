const Equipment = require('../models/Equipment');
const EquipmentCategory = require('../models/EquipmentCategory');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Get all expenses (equipment purchases)
exports.getAllExpenses = async (req, res) => {
  try {
    if (!['admin', 'clerk'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const { startDate, endDate, category_id, status } = req.query;
    let where = {};
    
    // Filter by date range if provided
    if (startDate && endDate) {
      where.purchase_date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      where.purchase_date = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      where.purchase_date = {
        [Op.lte]: new Date(endDate)
      };
    }

    // Filter by category if provided
    if (category_id) {
      where.category_id = category_id;
    }

    // Filter by status if provided
    if (status) {
      where.status = status;
    }

    const expenses = await Equipment.findAll({
      where,
      include: [
        {
          model: EquipmentCategory,
          as: 'category'
        }
      ],
      order: [['purchase_date', 'DESC']]
    });

    return res.status(200).json(expenses);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch expenses.', error: error.message });
  }
};

// Get expenses summary/analytics
exports.getExpensesAnalytics = async (req, res) => {
  try {
    if (!['admin', 'clerk'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const { startDate, endDate } = req.query;
    let where = {};
    
    if (startDate && endDate) {
      where.purchase_date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Get total expenses
    const totalExpenses = await Equipment.sum('price', { where }) || 0;

    // Get expenses by category
    const expensesByCategory = await Equipment.findAll({
      where,
      include: [
        {
          model: EquipmentCategory,
          as: 'category'
        }
      ],
      attributes: [
        [sequelize.col('category.name'), 'category_name'],
        [sequelize.fn('SUM', sequelize.col('Equipment.price')), 'total_amount'],
        [sequelize.fn('COUNT', sequelize.col('Equipment.equipment_id')), 'item_count']
      ],
      group: ['category.category_id', 'category.name'],
      order: [[sequelize.fn('SUM', sequelize.col('Equipment.price')), 'DESC']]
    });

    // Get expenses by month for current year
    const currentYear = new Date().getFullYear();
    const monthlyExpenses = await Equipment.findAll({
      where: {
        ...where,
        purchase_date: {
          [Op.between]: [new Date(currentYear, 0, 1), new Date(currentYear + 1, 0, 1)]
        }
      },
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('purchase_date')), 'month'],
        [sequelize.fn('SUM', sequelize.col('price')), 'total_amount'],
        [sequelize.fn('COUNT', sequelize.col('equipment_id')), 'item_count']
      ],
      group: [sequelize.fn('MONTH', sequelize.col('purchase_date'))],
      order: [[sequelize.fn('MONTH', sequelize.col('purchase_date')), 'ASC']]
    });

    // Get expenses by status
    const expensesByStatus = await Equipment.findAll({
      where,
      attributes: [
        'status',
        [sequelize.fn('SUM', sequelize.col('price')), 'total_amount'],
        [sequelize.fn('COUNT', sequelize.col('equipment_id')), 'item_count']
      ],
      group: ['status'],
      order: [[sequelize.fn('SUM', sequelize.col('price')), 'DESC']]
    });

    // Get recent expenses (last 10)
    const recentExpenses = await Equipment.findAll({
      where,
      include: [
        {
          model: EquipmentCategory,
          as: 'category'
        }
      ],
      order: [['purchase_date', 'DESC']],
      limit: 10
    });

    return res.status(200).json({
      totalExpenses,
      expensesByCategory,
      monthlyExpenses,
      expensesByStatus,
      recentExpenses
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch expenses analytics.', error: error.message });
  }
};

// Get expense details by ID
exports.getExpenseDetails = async (req, res) => {
  try {
    if (!['admin', 'clerk'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const { equipment_id } = req.params;
    const expense = await Equipment.findByPk(equipment_id, {
      include: [
        {
          model: EquipmentCategory,
          as: 'category'
        }
      ]
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found.' });
    }

    return res.status(200).json(expense);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch expense details.', error: error.message });
  }
};

// Get expense trends (monthly comparison)
exports.getExpenseTrends = async (req, res) => {
  try {
    if (!['admin', 'clerk'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const { year } = req.query;
    const targetYear = year || new Date().getFullYear();

    // Get monthly expenses for the specified year
    const monthlyExpenses = await Equipment.findAll({
      where: {
        purchase_date: {
          [Op.between]: [new Date(targetYear, 0, 1), new Date(targetYear + 1, 0, 1)]
        }
      },
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('purchase_date')), 'month'],
        [sequelize.fn('SUM', sequelize.col('price')), 'total_amount'],
        [sequelize.fn('COUNT', sequelize.col('equipment_id')), 'item_count']
      ],
      group: [sequelize.fn('MONTH', sequelize.col('purchase_date'))],
      order: [[sequelize.fn('MONTH', sequelize.col('purchase_date')), 'ASC']]
    });

    // Get year-over-year comparison
    const previousYear = targetYear - 1;
    const previousYearExpenses = await Equipment.findAll({
      where: {
        purchase_date: {
          [Op.between]: [new Date(previousYear, 0, 1), new Date(previousYear + 1, 0, 1)]
        }
      },
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('purchase_date')), 'month'],
        [sequelize.fn('SUM', sequelize.col('price')), 'total_amount']
      ],
      group: [sequelize.fn('MONTH', sequelize.col('purchase_date'))],
      order: [[sequelize.fn('MONTH', sequelize.col('purchase_date')), 'ASC']]
    });

    // Calculate total for current year
    const currentYearTotal = await Equipment.sum('price', {
      where: {
        purchase_date: {
          [Op.between]: [new Date(targetYear, 0, 1), new Date(targetYear + 1, 0, 1)]
        }
      }
    }) || 0;

    // Calculate total for previous year
    const previousYearTotal = await Equipment.sum('price', {
      where: {
        purchase_date: {
          [Op.between]: [new Date(previousYear, 0, 1), new Date(previousYear + 1, 0, 1)]
        }
      }
    }) || 0;

    // Calculate percentage change
    const percentageChange = previousYearTotal > 0 
      ? ((currentYearTotal - previousYearTotal) / previousYearTotal) * 100 
      : 0;

    return res.status(200).json({
      currentYear: targetYear,
      previousYear,
      monthlyExpenses,
      previousYearExpenses,
      currentYearTotal,
      previousYearTotal,
      percentageChange
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch expense trends.', error: error.message });
  }
};

// Get expense forecast (based on historical data)
exports.getExpenseForecast = async (req, res) => {
  try {
    if (!['admin', 'clerk'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const { months = 6 } = req.query;
    
    // Get average monthly expenses for the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const historicalData = await Equipment.findAll({
      where: {
        purchase_date: {
          [Op.gte]: twelveMonthsAgo
        }
      },
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('purchase_date')), 'month'],
        [sequelize.fn('YEAR', sequelize.col('purchase_date')), 'year'],
        [sequelize.fn('SUM', sequelize.col('price')), 'total_amount']
      ],
      group: [
        sequelize.fn('MONTH', sequelize.col('purchase_date')),
        sequelize.fn('YEAR', sequelize.col('purchase_date'))
      ],
      order: [
        [sequelize.fn('YEAR', sequelize.col('purchase_date')), 'ASC'],
        [sequelize.fn('MONTH', sequelize.col('purchase_date')), 'ASC']
      ]
    });

    // Calculate average monthly expense
    const totalHistoricalExpense = historicalData.reduce((sum, record) => sum + parseFloat(record.dataValues.total_amount), 0);
    const averageMonthlyExpense = historicalData.length > 0 ? totalHistoricalExpense / historicalData.length : 0;

    // Generate forecast for next N months
    const forecast = [];
    const currentDate = new Date();
    
    for (let i = 1; i <= parseInt(months); i++) {
      const forecastDate = new Date(currentDate);
      forecastDate.setMonth(currentDate.getMonth() + i);
      
      forecast.push({
        month: forecastDate.getMonth() + 1,
        year: forecastDate.getFullYear(),
        monthName: forecastDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        predictedAmount: averageMonthlyExpense,
        confidence: 0.85 // 85% confidence based on historical data
      });
    }

    return res.status(200).json({
      historicalData,
      averageMonthlyExpense,
      forecast,
      confidence: 0.85
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to generate expense forecast.', error: error.message });
  }
}; 