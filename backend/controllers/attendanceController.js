const Attendance = require('../models/Attendance');
const Member = require('../models/Member');
const MemberMembership = require('../models/MemberMembership');
const { Op } = require('sequelize');

exports.checkIn = async (req, res) => {
  try {
    if (req.user.role !== 'member') return res.status(403).json({ message: 'Only members can check in.' });
    const member = await Member.findOne({ where: { user_id: req.user.user_id } });
    if (!member) return res.status(404).json({ message: 'Member profile not found.' });
    // Find active membership
    const today = new Date();
    const membership = await MemberMembership.findOne({
      where: {
        member_id: member.member_id,
        plan_status: 'active',
        start_date: { [Op.lte]: today },
        end_date: { [Op.gte]: today }
      }
    });
    if (!membership) return res.status(403).json({ message: 'No active membership.' });
    // Check if already checked in today
    const existing = await Attendance.findOne({
      where: {
        member_id: member.member_id,
        date: today.toISOString().slice(0, 10)
      }
    });
    if (existing) return res.status(400).json({ message: 'Already checked in today.' });
    const attendance = await Attendance.create({
      member_id: member.member_id,
      membership_id: membership.membership_id,
      date: today.toISOString().slice(0, 10),
      time_in: today,
      status: 'present'
    });
    return res.status(201).json({ message: 'Checked in.', attendance });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to check in.', error: error.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    if (req.user.role !== 'member') return res.status(403).json({ message: 'Only members can check out.' });
    const member = await Member.findOne({ where: { user_id: req.user.user_id } });
    if (!member) return res.status(404).json({ message: 'Member profile not found.' });
    const today = new Date();
    const attendance = await Attendance.findOne({
      where: {
        member_id: member.member_id,
        date: today.toISOString().slice(0, 10),
        time_out: null
      }
    });
    if (!attendance) return res.status(404).json({ message: 'No check-in found for today.' });
    attendance.time_out = today;
    await attendance.save();
    return res.status(200).json({ message: 'Checked out.', attendance });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to check out.', error: error.message });
  }
};

exports.getMyAttendance = async (req, res) => {
  try {
    if (req.user.role !== 'member') return res.status(403).json({ message: 'Only members can view attendance.' });
    const member = await Member.findOne({ where: { user_id: req.user.user_id } });
    if (!member) return res.status(404).json({ message: 'Member profile not found.' });
    const records = await Attendance.findAll({
      where: { member_id: member.member_id },
      order: [['date', 'DESC']]
    });
    return res.status(200).json(records);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch attendance.', error: error.message });
  }
};

exports.scan = async (req, res) => {
  try {
    // Only admin or clerk can scan
    if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden.' });
    const { member_code } = req.body;
    if (!member_code) {
      return res.status(400).json({ message: 'member_code is required.' });
    }
    const member = await Member.findOne({ where: { member_code } });
    if (!member) return res.status(404).json({ message: 'Member not found.' });
    // Find active membership
    const today = new Date();
    const membership = await MemberMembership.findOne({
      where: {
        member_id: member.member_id,
        plan_status: 'active',
        start_date: { [Op.lte]: today },
        end_date: { [Op.gte]: today }
      }
    });
    if (!membership) return res.status(403).json({ message: 'No active membership.' });
    // Check today's attendance
    const todayStr = today.toISOString().slice(0, 10);
    let attendance = await Attendance.findOne({
      where: {
        member_id: member.member_id,
        date: todayStr
      }
    });
    if (!attendance) {
      // Not checked in yet: check in
      attendance = await Attendance.create({
        member_id: member.member_id,
        membership_id: membership.membership_id,
        date: todayStr,
        time_in: today,
        status: 'present'
      });
      return res.status(201).json({ message: 'Checked in.', attendance });
    } else if (!attendance.time_out) {
      // Checked in but not out: check interval
      const MIN_INTERVAL_MINUTES = 30;
      const now = new Date();
      const diffMinutes = (now - new Date(attendance.time_in)) / (1000 * 60);
      if (diffMinutes < MIN_INTERVAL_MINUTES) {
        return res.status(400).json({ message: `You must wait at least ${MIN_INTERVAL_MINUTES} minutes after check-in before checking out.` });
      }
      attendance.time_out = now;
      await attendance.save();
      return res.status(200).json({ message: 'Checked out.', attendance });
    } else {
      // Already checked out
      return res.status(400).json({ message: 'Already checked out today.' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Failed to scan.', error: error.message });
  }
};

exports.getTodayAttendance = async (req, res) => {
  try {
    if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden.' });
    const todayStr = new Date().toISOString().slice(0, 10);
    const records = await Attendance.findAll({
      where: { date: todayStr },
      order: [['time_in', 'ASC']]
    });
    return res.status(200).json(records);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch today\'s attendance.', error: error.message });
  }
}; 