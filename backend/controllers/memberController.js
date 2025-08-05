const Member = require('../models/Member');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/profile-pictures';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + req.params.memberId + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    console.log('Upload - Request received');
    console.log('Upload - User:', req.user);
    console.log('Upload - Member ID:', req.params.memberId);
    console.log('Upload - File:', req.file);
    
    const { memberId } = req.params;
    
    // Get the member record for the authenticated user
    const member = await Member.findOne({ 
      where: { 
        user_id: req.user.user_id 
      }
    });
    
    if (!member) {
      console.log('Upload - Member not found for user');
      return res.status(404).json({ error: 'Member not found' });
    }
    
    // Check if the member ID in URL matches the authenticated user's member ID
    console.log('Upload - Comparing member IDs:', member.member_id, 'vs', memberId, 'types:', typeof member.member_id, typeof memberId);
    if (parseInt(member.member_id) !== parseInt(memberId)) {
      console.log('Upload - Member ID mismatch:', member.member_id, 'vs', memberId);
      return res.status(403).json({ error: 'Unauthorized access to this member profile' });
    }
    
    if (!req.file) {
      console.log('Upload - No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Upload - File details:', {
      originalname: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Update member's profile picture path in database
    const profilePicturePath = req.file.path;
    
    console.log('Upload - Updating database with path:', profilePicturePath);
    
    const [result] = await Member.update(
      { profile_picture: profilePicturePath },
      { where: { member_id: memberId } }
    );

    console.log('Upload - Database update result:', result);

    if (result === 0) {
      console.log('Upload - Member not found');
      return res.status(404).json({ error: 'Member not found' });
    }

    console.log('Upload - Success, sending response');
    res.json({
      message: 'Profile picture uploaded successfully',
      profile_picture: profilePicturePath
    });

  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ error: 'Failed to upload profile picture: ' + error.message });
  }
};

// Get member profile
const getMemberProfile = async (req, res) => {
  try {
    const { memberId } = req.params;
    
    const member = await Member.findByPk(memberId, {
      attributes: ['member_id', 'first_name', 'last_name', 'email', 'phone', 'profile_picture', 'created_at']
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json(member);

  } catch (error) {
    console.error('Error getting member profile:', error);
    res.status(500).json({ error: 'Failed to get member profile' });
  }
};

// Update member profile
const updateMemberProfile = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { first_name, last_name, phone } = req.body;
    
    const [result] = await Member.update(
      { first_name, last_name, phone },
      { where: { member_id: memberId } }
    );

    if (result === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ message: 'Profile updated successfully' });

  } catch (error) {
    console.error('Error updating member profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Delete profile picture
const deleteProfilePicture = async (req, res) => {
  try {
    const { memberId } = req.params;
    
    // Get current profile picture path
    const member = await Member.findByPk(memberId);
    
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Delete file if it exists
    if (member.profile_picture && fs.existsSync(member.profile_picture)) {
      fs.unlinkSync(member.profile_picture);
    }

    // Update database to remove profile picture path
    await Member.update(
      { profile_picture: null },
      { where: { member_id: memberId } }
    );

    res.json({ message: 'Profile picture deleted successfully' });

  } catch (error) {
    console.error('Error deleting profile picture:', error);
    res.status(500).json({ error: 'Failed to delete profile picture' });
  }
};



module.exports = {
  uploadProfilePicture,
  getMemberProfile,
  updateMemberProfile,
  deleteProfilePicture,
  upload
}; 