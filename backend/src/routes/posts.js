const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { validatePost, handleValidationErrors } = require('../middleware/validation');
const { 
  getPosts, 
  getPost, 
  createPost, 
  updatePost, 
  deletePost,
  getPostStats
} = require('../controllers/postController');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/posts
router.get('/', getPosts);

// GET /api/posts/:postId
router.get('/:postId', getPost);

// GET /api/posts/:postId/stats
router.get('/:postId/stats', getPostStats);

// POST /api/posts
router.post('/', validatePost, handleValidationErrors, createPost);

// PUT /api/posts/:postId
router.put('/:postId', validatePost, handleValidationErrors, updatePost);

// DELETE /api/posts/:postId
router.delete('/:postId', deletePost);

module.exports = router;