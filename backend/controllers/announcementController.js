const Announcement = require('../models/Announcement');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');

exports.createAnnouncement = async (req, res) => {
  try {
    if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    const { title, message, target_audience } = req.body;
    if (!title || !message || !target_audience) {
      return res.status(400).json({ message: 'Title, message, and target audience are required.' });
    }
    const announcement = await Announcement.create({
      title,
      message,
      target_audience,
      created_by: req.user.user_id
    });
    // Send email to target audience
    let users = [];
    if (target_audience === 'all') {
      users = await User.findAll({ where: { status: 'active' } });
    } else {
      users = await User.findAll({ where: { status: 'active', role: target_audience.slice(0, -1) } });
    }
    for (const user of users) {
      await sendEmail(
        user.email,
        `New Announcement: ${title}`,
        `<p>${message}</p>`
      );
    }
    // Emit real-time event
    const io = req.app.get('io');
    io.emit('new_announcement', announcement);
    return res.status(201).json({ message: 'Announcement created and emails sent.', announcement });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create announcement.', error: error.message });
  }
};

exports.listAnnouncements = async (req, res) => {
  try {
    let where = {};
    if (req.user.role === 'member') {
      where = { target_audience: ['all', 'members'] };
    } else if (req.user.role === 'clerk') {
      where = { target_audience: ['all', 'clerks'] };
    }
    const announcements = await Announcement.findAll({
      where,
      order: [['created_at', 'DESC']]
    });
    return res.status(200).json(announcements);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch announcements.', error: error.message });
  }
}; 