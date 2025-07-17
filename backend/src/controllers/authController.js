const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const bloggerService = require('../services/bloggerService');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find admin user
    const admin = await Admin.findByUsername(username);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Check password
    const isValidPassword = await admin.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Set current user for blogger service
    bloggerService.setCurrentUser(admin._id);

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin._id, 
        username: admin.username,
        email: admin.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    
    if (error.message === 'Account is locked') {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed attempts. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt
      }
    });

  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isValidPassword = await admin.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// OAuth authorization endpoint
const getAuthUrl = async (req, res) => {
  try {
    const authUrl = await bloggerService.getAuthUrl();
    
    res.json({
      success: true,
      authUrl,
      message: 'Authorization URL generated successfully'
    });
  } catch (error) {
    console.error('Get auth URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate authorization URL',
      error: error.message
    });
  }
};

// OAuth callback endpoint
const handleOAuthCallback = async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required'
      });
    }

    // Exchange code for tokens
    const tokens = await bloggerService.exchangeCodeForTokens(code, req.user.id);
    
    res.json({
      success: true,
      message: 'OAuth authorization successful',
      hasRefreshToken: !!tokens.refresh_token
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({
      success: false,
      message: 'OAuth authorization failed',
      error: error.message
    });
  }
};

// Check OAuth status
const getOAuthStatus = async (req, res) => {
  try {
    const OAuthToken = require('../models/OAuthToken');
    const tokenData = await OAuthToken.findActiveToken(req.user.id);
    
    if (!tokenData) {
      return res.json({
        success: true,
        isAuthorized: false,
        message: 'No OAuth token found'
      });
    }

    res.json({
      success: true,
      isAuthorized: true,
      tokenInfo: tokenData.toSafeObject()
    });
  } catch (error) {
    console.error('Get OAuth status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get OAuth status',
      error: error.message
    });
  }
};

module.exports = {
  login,
  getMe,
  changePassword,
  getAuthUrl,
  handleOAuthCallback,
  getOAuthStatus
};