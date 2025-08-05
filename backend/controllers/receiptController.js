const Receipt = require('../models/Receipt');
const MemberMembership = require('../models/MemberMembership');
const Member = require('../models/Member');

exports.createReceipt = async (req, res) => {
  try {
    if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    const { member_membership_id, amount, payment_method, reference_number, receipt_url, details } = req.body;
    if (!member_membership_id || !amount || !payment_method) {
      return res.status(400).json({ message: 'Membership, amount, and payment method are required.' });
    }
    const receipt = await Receipt.create({
      member_membership_id,
      amount,
      payment_method,
      reference_number,
      receipt_url,
      details
    });
    return res.status(201).json({ message: 'Receipt created.', receipt });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create receipt.', error: error.message });
  }
};

exports.getMyReceipts = async (req, res) => {
  try {
    if (req.user.role !== 'member') return res.status(403).json({ message: 'Only members can view their receipts.' });
    const member = await Member.findOne({ where: { user_id: req.user.user_id } });
    if (!member) return res.status(404).json({ message: 'Member profile not found.' });
    // Find all member_membership_ids for this member
    const memberships = await MemberMembership.findAll({ where: { member_id: member.member_id } });
    const ids = memberships.map(m => m.member_membership_id);
    const receipts = await Receipt.findAll({
      where: { member_membership_id: ids },
      order: [['issued_at', 'DESC']]
    });
    return res.status(200).json(receipts);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch receipts.', error: error.message });
  }
};

exports.listReceipts = async (req, res) => {
  try {
    if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    const receipts = await Receipt.findAll({ order: [['issued_at', 'DESC']] });
    return res.status(200).json(receipts);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch receipts.', error: error.message });
  }
}; 