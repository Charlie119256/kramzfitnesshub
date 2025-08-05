const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Clerk = require('../models/Clerk');
const { sendEmail } = require('../utils/email');

exports.createClerk = async (req, res) => {
  try {
    const { email, first_name, middle_name, last_name, suffix, dob, gender, contact_number, barangay, municipality, city } = req.body;
    if (!email || !first_name || !last_name || !dob || !gender || !contact_number || !barangay || !municipality || !city) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered.' });
    }
    const verificationToken = Math.random().toString(36).substring(2, 15);
    const user = await User.create({
      email,
      password: '', // Clerk will set password after verification
      role: 'clerk',
      verification_token: verificationToken,
      email_verified: false,
      status: 'active',
    });
    const clerk = await Clerk.create({
      user_id: user.user_id,
      first_name,
      middle_name,
      last_name,
      suffix,
      dob,
      gender,
      contact_number,
      barangay,
      municipality,
      city,
    });
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
    await sendEmail(
      email,
      'Kramz Fitness Hub Clerk Account - Verify Email',
      `<p>You have been added as a clerk. Please verify your email and set your password by clicking the link below:</p><p><a href="${verifyUrl}">Verify Email</a></p>`
    );
    return res.status(201).json({ message: 'Clerk created and verification email sent.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create clerk.', error: error.message });
  }
};

exports.getClerks = async (req, res) => {
  try {
    const clerks = await Clerk.findAll({ include: [{ model: User, as: 'user', attributes: ['email', 'status', 'email_verified'] }] });
    return res.status(200).json(clerks);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch clerks.', error: error.message });
  }
};

exports.updateClerk = async (req, res) => {
  try {
    const { clerk_id } = req.params;
    const updateFields = req.body;
    const clerk = await Clerk.findByPk(clerk_id);
    if (!clerk) return res.status(404).json({ message: 'Clerk not found.' });
    await clerk.update(updateFields);
    return res.status(200).json({ message: 'Clerk updated successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update clerk.', error: error.message });
  }
};

exports.deactivateClerk = async (req, res) => {
  try {
    const { clerk_id } = req.params;
    const clerk = await Clerk.findByPk(clerk_id);
    if (!clerk) return res.status(404).json({ message: 'Clerk not found.' });
    const user = await User.findByPk(clerk.user_id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.status = 'inactive';
    await user.save();
    return res.status(200).json({ message: 'Clerk deactivated.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to deactivate clerk.', error: error.message });
  }
};

exports.editClerkProfile = async (req, res) => {
  try {
    const { clerk_id } = req.params;
    const updateFields = req.body;

    // Only allow certain fields to be updated
    const allowedFields = [
      'first_name', 'middle_name', 'last_name', 'suffix',
      'dob', 'gender', 'contact_number', 'barangay', 'municipality', 'city'
    ];
    const updateData = {};
    for (let key in updateFields) {
      if (allowedFields.includes(key)) {
        updateData[key] = updateFields[key];
      }
    }
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update.' });
    }
    const clerk = await Clerk.findByPk(clerk_id);
    if (!clerk) return res.status(404).json({ message: 'Clerk not found.' });

    // Only allow if the user is admin or the owner of the profile
    if (req.user.role !== 'admin' && req.user.user_id !== clerk.user_id) {
      return res.status(403).json({ message: 'You are not allowed to edit this profile.' });
    }
    await clerk.update(updateData);
    return res.status(200).json({ message: 'Profile updated successfully.', clerk });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update profile.', error: error.message });
  }
}; 