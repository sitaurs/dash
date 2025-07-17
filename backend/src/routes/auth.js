const express = require('express');
const { validateLogin, handleValidationErrors } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const { 
  login, 
  getMe, 
  changePassword,
  getAuthUrl,
  handleOAuthCallback,
  getOAuthStatus
} = require('../controllers/authController');

const router = express.Router();

// POST /api/admin/login
router.post('/login', validateLogin, handleValidationErrors, login);

// GET /api/admin/me
router.get('/me', authenticateToken, getMe);

// POST /api/admin/change-password
router.post('/change-password', authenticateToken, changePassword);

// OAuth routes
// GET /api/admin/oauth/url - Get authorization URL
router.get('/oauth/url', authenticateToken, getAuthUrl);

// GET /api/admin/oauth/callback - Handle OAuth callback
router.get('/oauth/callback', authenticateToken, handleOAuthCallback);

// GET /api/admin/oauth/status - Check OAuth status
router.get('/oauth/status', authenticateToken, getOAuthStatus);

module.exports = router;