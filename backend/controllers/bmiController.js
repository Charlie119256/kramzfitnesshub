const BmiRecord = require('../models/BmiRecord');
const Member = require('../models/Member');

exports.addBmiRecord = async (req, res) => {
  try {
    if (req.user.role !== 'member') return res.status(403).json({ message: 'Only members can add BMI records.' });
    const { height_cm, weight_kg, notes } = req.body;
    if (!height_cm || !weight_kg) return res.status(400).json({ message: 'Height and weight are required.' });
    const member = await Member.findOne({ where: { user_id: req.user.user_id } });
    if (!member) return res.status(404).json({ message: 'Member profile not found.' });
    const height_m = parseFloat(height_cm) / 100;
    const bmi_value = parseFloat(weight_kg) / (height_m * height_m);
    const record = await BmiRecord.create({
      member_id: member.member_id,
      height_cm,
      weight_kg,
      bmi_value: bmi_value.toFixed(2),
      notes
    });
    return res.status(201).json({ message: 'BMI record saved.', record });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to save BMI record.', error: error.message });
  }
};

exports.getMyBmiRecords = async (req, res) => {
  try {
    if (req.user.role !== 'member') return res.status(403).json({ message: 'Only members can view BMI records.' });
    const member = await Member.findOne({ where: { user_id: req.user.user_id } });
    if (!member) return res.status(404).json({ message: 'Member profile not found.' });
    const records = await BmiRecord.findAll({
      where: { member_id: member.member_id },
      order: [['recorded_at', 'DESC']]
    });
    return res.status(200).json(records);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch BMI records.', error: error.message });
  }
}; 