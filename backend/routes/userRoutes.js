const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/auth');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/verify-email', userController.verifyEmail);
router.post('/resend-verification', userController.resendVerification);
router.post('/request-password-reset', userController.requestPasswordReset);
router.post('/reset-password', userController.resetPassword);
router.post('/set-password', userController.setPasswordAfterVerification);
router.put('/members/:member_id', authenticate, userController.editMemberProfile);
router.get('/my-memberships', authenticate, userController.getMyMemberships);

module.exports = router; 