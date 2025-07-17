const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { 
  getComments, 
  updateCommentStatus, 
  deleteComment 
} = require('../controllers/commentController');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/comments
router.get('/', getComments);

// PUT /api/comments/:commentId
router.put('/:commentId', updateCommentStatus);

// DELETE /api/comments/:commentId
router.delete('/:commentId', deleteComment);

module.exports = router;