const { Op } = require('sequelize');
const MemberMembership = require('./models/MemberMembership');
const Member = require('./models/Member');
const User = require('./models/User');
const MembershipType = require('./models/MembershipType');
const Notification = require('./models/Notification');
const { sendEmail } = require('./utils/email');
const cron = require('node-cron');
const app = require('./index');

const DAYS_BEFORE_EXPIRY = 3;

async function notifyExpiringAndExpiredMemberships() {
  const today = new Date();
  const soon = new Date();
  soon.setDate(today.getDate() + DAYS_BEFORE_EXPIRY);

  // Notify expiring soon
  const expiringSoon = await MemberMembership.findAll({
    where: {
      plan_status: 'active',
      end_date: { [Op.between]: [today, soon] }
    }
  });
  for (const membership of expiringSoon) {
    const member = await Member.findByPk(membership.member_id);
    const user = await User.findByPk(member.user_id);
    const plan = await MembershipType.findByPk(membership.membership_id);
    // Check if already notified (avoid duplicate notifications)
    const alreadyNotified = await Notification.findOne({
      where: {
        user_id: user.user_id,
        type: 'membership_expiry',
        title: 'Membership Expiring Soon',
        message: { [Op.like]: `%${plan.name}%${membership.end_date}%` }
      }
    });
    if (!alreadyNotified) {
      const notification = await Notification.create({
        user_id: user.user_id,
        type: 'membership_expiry',
        title: 'Membership Expiring Soon',
        message: `Your membership for the ${plan.name} plan will expire on ${membership.end_date}. Please renew soon to avoid interruption.`
      });
      await sendEmail(
        user.email,
        'Membership Expiring Soon',
        `<p>Your membership for the <b>${plan.name}</b> plan will expire on <b>${membership.end_date}</b>. Please renew soon to avoid interruption.</p>`
      );
      try {
        const io = app.get('io');
        io.emit('new_notification', notification);
      } catch (e) {}
    }
  }

  // Mark expired and notify
  const expired = await MemberMembership.findAll({
    where: {
      plan_status: 'active',
      end_date: { [Op.lt]: today }
    }
  });
  for (const membership of expired) {
    membership.plan_status = 'expired';
    await membership.save();
    const member = await Member.findByPk(membership.member_id);
    const user = await User.findByPk(member.user_id);
    const plan = await MembershipType.findByPk(membership.membership_id);
    const notification = await Notification.create({
      user_id: user.user_id,
      type: 'membership_expiry',
      title: 'Membership Expired',
      message: `Your membership for the ${plan.name} plan has expired as of ${membership.end_date}. Please renew to continue enjoying our services.`
    });
    await sendEmail(
      user.email,
      'Membership Expired',
      `<p>Your membership for the <b>${plan.name}</b> plan has expired as of <b>${membership.end_date}</b>. Please renew to continue enjoying our services.</p>`
    );
    try {
      const io = app.get('io');
      io.emit('new_notification', notification);
    } catch (e) {}
  }
}

// Schedule to run every day at 8:00 AM
cron.schedule('0 8 * * *', notifyExpiringAndExpiredMemberships);

// For manual run/testing
if (require.main === module) {
  notifyExpiringAndExpiredMemberships().then(() => {
    console.log('Checked for expiring/expired memberships and notified members.');
    process.exit(0);
  });
} 