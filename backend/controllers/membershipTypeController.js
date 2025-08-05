const MembershipType = require('../models/MembershipType');

exports.createMembershipType = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
    const { name, price, duration_days, description } = req.body;
    if (!name || !price || !duration_days) {
      return res.status(400).json({ message: 'Name, price, and duration are required.' });
    }
    const plan = await MembershipType.create({ name, price, duration_days, description });
    return res.status(201).json({ message: 'Membership type created.', plan });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create membership type.', error: error.message });
  }
};

exports.listMembershipTypes = async (req, res) => {
  try {
    let where = { is_active: true };
    if (req.user && req.user.role === 'admin' && req.query.all === 'true') {
      where = {};
    }
    const plans = await MembershipType.findAll({ where });
    return res.status(200).json(plans);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch membership types.', error: error.message });
  }
};

exports.updateMembershipType = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
    const { membership_id } = req.params;
    const { name, price, duration_days, description } = req.body;
    const plan = await MembershipType.findByPk(membership_id);
    if (!plan) return res.status(404).json({ message: 'Membership type not found.' });
    await plan.update({ name, price, duration_days, description });
    return res.status(200).json({ message: 'Membership type updated.', plan });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update membership type.', error: error.message });
  }
};

exports.deleteMembershipType = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
    const { membership_id } = req.params;
    const plan = await MembershipType.findByPk(membership_id);
    if (!plan) return res.status(404).json({ message: 'Membership type not found.' });
    plan.is_active = false;
    await plan.save();
    return res.status(200).json({ message: 'Membership type deactivated (soft deleted).' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete membership type.', error: error.message });
  }
}; 