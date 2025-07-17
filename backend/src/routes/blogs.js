const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getBlogs, getBlog, syncBlogs } = require('../controllers/blogController');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/blogs
router.get('/', getBlogs);

// GET /api/blogs/sync
router.get('/sync', syncBlogs);

// GET /api/blogs/:blogId
router.get('/:blogId', getBlog);

module.exports = router;