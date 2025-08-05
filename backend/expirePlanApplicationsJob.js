const { Op } = require('sequelize');
const PlanApplication = require('./models/PlanApplication');
const Member = require('./models/Member');
const User = require('./models/User');
const MembershipType = require('./models/MembershipType');
const Notification = require('./models/Notification');
const { sendEmail } = require('./utils/email');
const cron = require('node-cron');
const app = require('./index');

async function expireOldApplications() {
  const today = new Date();
  const expiredApps = await PlanApplication.findAll({
    where: {
      status: 'pending',
      preferred_start_date: { [Op.lt]: today }
    }
  });
  for (const appRow of expiredApps) {
    appRow.status = 'expired';
    await appRow.save();
    // Notify member
    const member = await Member.findByPk(appRow.member_id);
    const user = await User.findByPk(member.user_id);
    const plan = await MembershipType.findByPk(appRow.membership_id);
    const notification = await Notification.create({
      user_id: user.user_id,
      type: 'announcement',
      title: 'Membership Plan Application Expired',
      message: `Your application for the ${plan.name} plan has expired because it was not processed in time. Please submit a new application if you wish to continue.`
    });
    await sendEmail(
      user.email,
      'Membership Plan Application Expired',
      `<p>Your application for the <b>${plan.name}</b> plan has expired because it was not processed in time. Please submit a new application if you wish to continue.</p>`
    );
    // Emit real-time event
    try {
      const io = app.get('io');
      io.emit('new_notification', notification);
    } catch (e) {}
  }
}

// Schedule to run every day at 8:00 AM
cron.schedule('0 8 * * *', expireOldApplications);

// For manual run/testing
if (require.main === module) {
  expireOldApplications().then(() => {
    console.log('Expired old plan applications and notified members.');
    process.exit(0);
  });
} 