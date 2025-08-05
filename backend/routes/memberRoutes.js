const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const { authenticate } = require('../middlewares/auth');

// Member profile routes
router.get('/profile/:memberId', authenticate, memberController.getMemberProfile);
router.put('/profile/:memberId', authenticate, memberController.updateMemberProfile);

// Profile picture routes
router.post('/profile/:memberId/picture', authenticate, memberController.upload.single('profile_picture'), memberController.uploadProfilePicture);
router.delete('/profile/:memberId/picture', authenticate, memberController.deleteProfilePicture);

// Test endpoint to verify member ID
router.get('/test/:memberId', authenticate, async (req, res) => {
  try {
    console.log('Test - User:', req.user);
    console.log('Test - Member ID:', req.params.memberId);
    
    // Get the member record for the authenticated user
    const member = await Member.findOne({ 
      where: { user_id: req.user.user_id }
    });
    
    console.log('Test - Found member:', member);
    
    res.json({ 
      message: 'Test successful',
      user: req.user,
      requestedMemberId: req.params.memberId,
      actualMemberId: member ? member.member_id : null,
      memberFound: !!member
    });
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ error: error.message });
  }
});



module.exports = router; 