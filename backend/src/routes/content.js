const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { 
  uploadFile, 
  getContent, 
  deleteContent 
} = require('../controllers/contentController');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// POST /api/content/upload
router.post('/upload', uploadFile);

// GET /api/content
router.get('/', getContent);

// DELETE /api/content/:contentId
router.delete('/:contentId', deleteContent);

module.exports = router;