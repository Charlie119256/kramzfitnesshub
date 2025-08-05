const Notification = require('../models/Notification');

exports.listNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.user_id },
      order: [['created_at', 'DESC']]
    });
    return res.status(200).json(notifications);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch notifications.', error: error.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const { notification_id } = req.params;
    const notification = await Notification.findOne({ where: { notification_id, user_id: req.user.user_id } });
    if (!notification) return res.status(404).json({ message: 'Notification not found.' });
    notification.is_read = true;
    await notification.save();
    // Emit real-time event (optional, for demonstration)
    const io = req.app.get('io');
    io.emit('notification_read', { notification_id, user_id: req.user.user_id });
    return res.status(200).json({ message: 'Notification marked as read.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to mark notification as read.', error: error.message });
  }
}; 