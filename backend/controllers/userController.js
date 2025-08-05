const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Member = require('../models/Member');
const MemberMembership = require('../models/MemberMembership');
const MembershipType = require('../models/MembershipType');
const { sendEmail } = require('../utils/email');
const { generateMemberQr } = require('../utils/qr');
const path = require('path');
const fs = require('fs');
const sequelize = require('../config/database');
require('dotenv').config();

// Utility function to clean up duplicate users
async function cleanupDuplicateUsers() {
  try {
    // Find all emails that have multiple users
    const duplicateEmails = await sequelize.query(`
      SELECT email, COUNT(*) as count
      FROM users
      GROUP BY email
      HAVING COUNT(*) > 1
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('Found duplicate emails:', duplicateEmails);

    for (const duplicate of duplicateEmails) {
      const users = await User.findAll({ 
        where: { email: duplicate.email },
        order: [['user_id', 'ASC']] // Keep the oldest user (lowest ID)
      });

      if (users.length > 1) {
        console.log(`Cleaning up ${users.length} users with email ${duplicate.email}`);
        
        // Keep the first user, delete the rest
        const userToKeep = users[0];
        const usersToDelete = users.slice(1);
        
        for (const user of usersToDelete) {
          await user.destroy();
          console.log(`Deleted user ID ${user.user_id}`);
        }
        
        console.log(`Kept user ID ${userToKeep.user_id} for email ${duplicate.email}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up duplicate users:', error);
  }
}

exports.register = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      email,
      password,
      first_name,
      middle_name,
      last_name,
      suffix,
      dob,
      gender,
      contact_number,
      barangay,
      municipality,
      city
    } = req.body;
    if (!email || !password || !first_name || !last_name || !dob || !gender || !contact_number || !barangay || !municipality || !city) {
      await t.rollback();
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    const existingUsers = await User.findAll({ where: { email }, transaction: t });
    if (existingUsers.length > 0) {
      await t.rollback();
      return res.status(409).json({ message: 'Email already registered.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = Math.random().toString(36).substring(2, 15);
    // Production: 24 hours
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    // Testing: 1 minute (uncomment for testing)
    // const verificationTokenExpires = new Date(Date.now() + 1 * 60 * 1000);
    
    console.log('Debug - Token creation:');
    console.log('Token expires:', verificationTokenExpires.toISOString());
    console.log('New token:', verificationToken);
    
    const user = await User.create({
      email,
      password: hashedPassword,
      role: 'member',
      verification_token: verificationToken,
      verification_token_expires: verificationTokenExpires
    });
    // Generate member_code: KFH-YYYYNNNN
    const year = new Date().getFullYear();
    const count = await Member.count({
      where: sequelize.where(
        sequelize.fn('YEAR', sequelize.col('created_at')),
        year
      ),
      transaction: t
    });
    const sequence = (count + 1).toString().padStart(4, '0');
    const member_code = `KFH-${year}${sequence}`;
    const member = await Member.create({
      user_id: user.user_id,
      member_code,
      first_name,
      middle_name,
      last_name,
      suffix,
      dob,
      gender,
      contact_number,
      barangay,
      municipality,
      city
    }, { transaction: t });
    // Generate QR code and save path
    const qrDir = path.join(__dirname, '../uploads/qrcodes');
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }
    const qrFileName = `${member.member_id}.png`;
    const qrFilePath = path.join(qrDir, qrFileName);
    await generateMemberQr(member.member_code, qrFilePath);
    member.qr_code_path = `uploads/qrcodes/${qrFileName}`;
    await member.save({ transaction: t });
    // Send verification email (outside transaction, but after commit)
    await t.commit();
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
    
    console.log('Debug - Registration: Sending verification email');
    console.log('Email:', email);
    console.log('Token:', verificationToken);
    console.log('URL:', verifyUrl);
    
    await sendEmail(
      email,
      'Verify your email',
      `<p>Thank you for registering. Please verify your email by clicking the link below:</p><p><a href="${verifyUrl}">Verify Email</a></p>`
    );
    
    console.log('Debug - Registration: Verification email sent successfully');
    return res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });
  } catch (error) {
    if (t) await t.rollback();
    return res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.query;
    
    console.log('Debug - verifyEmail called with:');
    console.log('Token:', token);
    console.log('Email:', email);
    console.log('Token length:', token ? token.length : 0);
    
    if (!token || !email) {
      console.log('Error: Missing token or email');
      return res.status(400).json({ message: 'Token and email are required.' });
    }

    // First check if user exists
    const users = await User.findAll({ where: { email } });
    if (users.length === 0) {
      console.log('Error: User not found for email:', email);
      return res.status(400).json({ message: 'Invalid verification link.' });
    }
    
    // If multiple users exist, use the first one
    const user = users[0];
    if (users.length > 1) {
      console.log(`Warning: Found ${users.length} users with email ${email}. Using the first one.`);
    }

    console.log('Debug - User found:', {
      user_id: user.user_id,
      email: user.email,
      email_verified: user.email_verified,
      has_verification_token: !!user.verification_token,
      verification_token_expires: user.verification_token_expires,
      stored_token: user.verification_token
    });

    // Check if email is already verified
    if (user.email_verified) {
      console.log('Debug: Email already verified');
      // Generate JWT token for already verified user
      const jwtToken = jwt.sign(
        { user_id: user.user_id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      
      return res.status(200).json({ 
        message: 'Email is already verified. You can access your dashboard.',
        token: jwtToken,
        user: { user_id: user.user_id, email: user.email, role: user.role },
        alreadyVerified: true
      });
    }
    
    // Check if token matches
    if (user.verification_token !== token) {
      console.log('Error: Token mismatch');
      console.log('Expected token:', user.verification_token);
      console.log('Received token:', token);
      return res.status(400).json({ message: 'Invalid or expired verification link.' });
    }
    
    // Check if token has expired
    if (user.verification_token_expires) {
      const currentTime = new Date();
      const expirationTime = new Date(user.verification_token_expires);
      
      // Debug logging
      console.log('Debug - Token expiration check:');
      console.log('Current time:', currentTime.toISOString());
      console.log('Token expires:', expirationTime.toISOString());
      console.log('Is expired?', currentTime > expirationTime);
      
      if (currentTime > expirationTime) {
        console.log('Error: Token expired');
        return res.status(400).json({ message: 'Verification link has expired. Please request a new verification email.' });
      }
    }
    
    console.log('Debug: Proceeding with email verification');
    
    // Verify the email
    user.email_verified = true;
    user.verification_token = null;
    user.verification_token_expires = null;
    await user.save();
    
    // Generate JWT token for automatic login
    const jwtToken = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    console.log('Debug: Email verification successful');
    
    return res.status(200).json({ 
      message: 'Email verified successfully. You can now access your dashboard.',
      token: jwtToken,
      user: { user_id: user.user_id, email: user.email, role: user.role },
      alreadyVerified: false
    });
  } catch (error) {
    console.error('Error in verifyEmail:', error);
    return res.status(500).json({ message: 'Email verification failed.', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    if (!user.email_verified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // If user is a member, fetch member data
    let memberInfo = null;
    if (user.role === 'member') {
      const member = await Member.findOne({ 
        where: { user_id: user.user_id },
        attributes: ['member_id', 'first_name', 'last_name', 'member_code']
      });
      if (member) {
        memberInfo = {
          member_id: member.member_id,
          first_name: member.first_name,
          last_name: member.last_name,
          member_code: member.member_code,
          full_name: `${member.first_name} ${member.last_name}`
        };
      }
    }

    return res.status(200).json({ 
      token, 
      user: { 
        user_id: user.user_id, 
        email: user.email, 
        role: user.role,
        memberInfo: memberInfo
      } 
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed.', error: error.message });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Debug - Resend verification called for email:', email);
    
    if (!email) return res.status(400).json({ message: 'Email is required.' });
    
    // Clean up any duplicate users first
    await cleanupDuplicateUsers();
    
    // Find all users with this email
    const users = await User.findAll({ where: { email } });
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    // If multiple users exist with same email, keep only the first one and delete others
    if (users.length > 1) {
      console.log(`Found ${users.length} users with email ${email}. Keeping the first one and deleting others.`);
      
      // Keep the first user, delete the rest
      const userToKeep = users[0];
      const usersToDelete = users.slice(1);
      
      for (const user of usersToDelete) {
        await user.destroy();
      }
      
      console.log(`Deleted ${usersToDelete.length} duplicate users.`);
    }
    
    const user = users[0];
    
    if (user.email_verified) return res.status(400).json({ message: 'Email is already verified.' });
    
    // Clear any existing verification tokens first
    user.verification_token = null;
    user.verification_token_expires = null;
    await user.save();
    
    console.log(`Cleared old tokens for user ID ${user.user_id}`);
    
    const verificationToken = Math.random().toString(36).substring(2, 15);
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    // const verificationTokenExpires = new Date(Date.now() + 1 * 60 * 1000); // 1 minute from now (for testing)
    
    console.log('Debug - Resend verification token creation:');
    console.log('Token expires:', verificationTokenExpires.toISOString());
    console.log('User ID:', user.user_id);
    console.log('New token:', verificationToken);
    console.log('Email being used:', email);
    
    user.verification_token = verificationToken;
    user.verification_token_expires = verificationTokenExpires;
    await user.save();
    
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
    await sendEmail(
      email,
      'Resend: Verify your email',
      `<p>Please verify your email by clicking the link below:</p><p><a href="${verifyUrl}">Verify Email</a></p>`
    );
    return res.status(200).json({ message: 'Verification email resent. Please check your inbox.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to resend verification email.', error: error.message });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const resetToken = Math.random().toString(36).substring(2, 15);
    const resetTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    // const resetTokenExpires = new Date(Date.now() + 1 * 60 * 1000); // 1 minute from now (for testing)
    
    console.log('Debug - Password reset token creation:');
    console.log('Token expires:', resetTokenExpires.toISOString());
    
    user.reset_token = resetToken;
    user.reset_token_expires = resetTokenExpires;
    await user.save();
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    await sendEmail(
      email,
      'Password Reset Request',
      `<p>Click the link below to reset your password:</p><p><a href="${resetUrl}">Reset Password</a></p>`
    );
    return res.status(200).json({ message: 'Password reset email sent. Please check your inbox.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to send password reset email.', error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: 'Email, token, and new password are required.' });
    }
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid reset link.' });
    }
    
    // Check if token matches
    if (user.reset_token !== token) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }
    
    // Check if token has expired
    if (user.reset_token_expires) {
      const currentTime = new Date();
      const expirationTime = new Date(user.reset_token_expires);
      
      // Debug logging
      console.log('Debug - Password reset token expiration check:');
      console.log('Current time:', currentTime.toISOString());
      console.log('Token expires:', expirationTime.toISOString());
      console.log('Is expired?', currentTime > expirationTime);
      
      if (currentTime > expirationTime) {
        return res.status(400).json({ message: 'Reset link has expired. Please request a new password reset.' });
      }
    }
    
    // Reset the password
    user.password = await bcrypt.hash(newPassword, 10);
    user.reset_token = null;
    user.reset_token_expires = null;
    await user.save();
    
    return res.status(200).json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to reset password.', error: error.message });
  }
};

exports.setPasswordAfterVerification = async (req, res) => {
  try {
    const { email, token, password } = req.body;
    if (!email || !token || !password) {
      return res.status(400).json({ message: 'Email, token, and password are required.' });
    }
    const user = await User.findOne({ where: { email, verification_token: token } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification link.' });
    }
    user.password = await bcrypt.hash(password, 10);
    user.email_verified = true;
    user.verification_token = null;
    await user.save();
    return res.status(200).json({ message: 'Password set and email verified. You can now log in.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to set password and verify email.', error: error.message });
  }
};

exports.editMemberProfile = async (req, res) => {
  try {
    const { member_id } = req.params;
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
    const member = await Member.findByPk(member_id);
    if (!member) return res.status(404).json({ message: 'Member not found.' });

    // Only allow if the user is admin or the owner of the profile
    if (req.user.role !== 'admin' && req.user.user_id !== member.user_id) {
      return res.status(403).json({ message: 'You are not allowed to edit this profile.' });
    }
    await member.update(updateData);
    return res.status(200).json({ message: 'Profile updated successfully.', member });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update profile.', error: error.message });
  }
};

exports.getMyMemberships = async (req, res) => {
  try {
    if (req.user.role !== 'member') {
      return res.status(403).json({ message: 'Only members can view their memberships.' });
    }
    const Member = require('../models/Member');
    const member = await Member.findOne({ where: { user_id: req.user.user_id } });
    if (!member) return res.status(404).json({ message: 'Member profile not found.' });
    const memberships = await MemberMembership.findAll({
      where: { member_id: member.member_id },
      include: [{ model: MembershipType, as: 'plan', attributes: ['name', 'price', 'duration_days', 'description'] }],
      order: [['start_date', 'DESC']]
    });
    return res.status(200).json(memberships);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch memberships.', error: error.message });
  }
}; 