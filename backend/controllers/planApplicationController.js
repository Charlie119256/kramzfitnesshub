const PlanApplication = require('../models/PlanApplication');
const MembershipType = require('../models/MembershipType');
const Member = require('../models/Member');
const MemberMembership = require('../models/MemberMembership');
const Receipt = require('../models/Receipt');
const Notification = require('../models/Notification');
const { Op } = require('sequelize');
const { sendEmail } = require('../utils/email');

exports.applyForPlan = async (req, res) => {
  try {
    const { membership_id, preferred_start_date } = req.body;
    // Only members can apply
    if (req.user.role !== 'member') {
      return res.status(403).json({ message: 'Only members can apply for a plan.' });
    }
    // Find the member_id for this user
    const member = await Member.findOne({ where: { user_id: req.user.user_id } });
    if (!member) return res.status(404).json({ message: 'Member profile not found.' });
    // Check if the plan exists
    const plan = await MembershipType.findByPk(membership_id);
    if (!plan) return res.status(404).json({ message: 'Membership plan not found.' });
    // Check for existing pending or accepted application for this member and plan
    const existing = await PlanApplication.findOne({
      where: {
        member_id: member.member_id,
        membership_id,
        status: ['pending', 'accepted']
      }
    });
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending or active application for this plan.' });
    }
    // Create the application
    const application = await PlanApplication.create({
      member_id: member.member_id,
      membership_id,
      preferred_start_date,
      status: 'pending'
    });
    return res.status(201).json({ message: 'Plan application submitted.', application });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to apply for plan.', error: error.message });
  }
};

exports.listPlanApplications = async (req, res) => {
  try {
    if (!['clerk', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const status = req.query.status; // optional filter
    const where = status ? { status } : {};
    const applications = await PlanApplication.findAll({ 
      where,
      include: [
        {
          model: Member,
          as: 'member',
          include: [
            {
              model: User,
              as: 'user'
            }
          ]
        },
        {
          model: MembershipType,
          as: 'membership_type'
        }
      ],
      order: [['created_at', 'DESC']]
    });
    return res.status(200).json(applications);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch applications.', error: error.message });
  }
};

exports.acceptPlanApplication = async (req, res) => {
  try {
    if (!['clerk', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { application_id } = req.params;
    const { payment_amount, payment_date, payment_method, reference_number } = req.body;
    if (!payment_amount || !payment_date || !payment_method) {
      return res.status(400).json({ message: 'Payment amount, date, and method are required.' });
    }
    const application = await PlanApplication.findByPk(application_id);
    if (!application) return res.status(404).json({ message: 'Application not found.' });
    if (application.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending applications can be accepted.' });
    }
    // Get plan duration
    const plan = await MembershipType.findByPk(application.membership_id);
    if (!plan) return res.status(404).json({ message: 'Membership plan not found.' });
    // Calculate start and end dates
    const start_date = application.preferred_start_date;
    const end_date = new Date(start_date);
    end_date.setDate(end_date.getDate() + plan.duration_days - 1);
    // Create member_membership record
    const memberMembership = await MemberMembership.create({
      member_id: application.member_id,
      membership_id: application.membership_id,
      start_date,
      end_date,
      plan_status: 'active',
    });
    application.status = 'accepted';
    application.payment_amount = payment_amount;
    application.payment_date = payment_date;
    await application.save();
    // Automatically create receipt
    await Receipt.create({
      member_membership_id: memberMembership.member_membership_id,
      amount: payment_amount,
      payment_method,
      reference_number
    });
    // Notify member (notification + email + real-time)
    const member = await Member.findByPk(application.member_id);
    const user = await User.findByPk(member.user_id);
    const notification = await Notification.create({
      user_id: user.user_id,
      type: 'announcement',
      title: 'Membership Plan Application Accepted',
      message: `Your application for the ${plan.name} plan has been accepted. Your membership is now active.`
    });
    await sendEmail(
      user.email,
      'Membership Plan Application Accepted',
      `<p>Your application for the <b>${plan.name}</b> plan has been accepted. Your membership is now active.</p>`
    );
    const io = req.app.get('io');
    io.emit('new_notification', notification);
    return res.status(200).json({ message: 'Application accepted, membership activated, and receipt created.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to accept application.', error: error.message });
  }
};

exports.declinePlanApplication = async (req, res) => {
  try {
    if (!['clerk', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { application_id } = req.params;
    const application = await PlanApplication.findByPk(application_id);
    if (!application) return res.status(404).json({ message: 'Application not found.' });
    if (application.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending applications can be declined.' });
    }
    application.status = 'declined';
    await application.save();
    // Notify member (notification + email + real-time)
    const member = await Member.findByPk(application.member_id);
    const user = await User.findByPk(member.user_id);
    const plan = await MembershipType.findByPk(application.membership_id);
    const notification = await Notification.create({
      user_id: user.user_id,
      type: 'announcement',
      title: 'Membership Plan Application Declined',
      message: `Your application for the ${plan.name} plan has been declined. Please contact the gym for more information.`
    });
    await sendEmail(
      user.email,
      'Membership Plan Application Declined',
      `<p>Your application for the <b>${plan.name}</b> plan has been declined. Please contact the gym for more information.</p>`
    );
    const io = req.app.get('io');
    io.emit('new_notification', notification);
    return res.status(200).json({ message: 'Application declined.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to decline application.', error: error.message });
  }
}; 