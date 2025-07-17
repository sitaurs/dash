const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { 
  getPages, 
  getPage, 
  createPage, 
  updatePage, 
  deletePage 
} = require('../controllers/pageController');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/pages
router.get('/', getPages);

// GET /api/pages/:pageId
router.get('/:pageId', getPage);

// POST /api/pages
router.post('/', createPage);

// PUT /api/pages/:pageId
router.put('/:pageId', updatePage);

// DELETE /api/pages/:pageId
router.delete('/:pageId', deletePage);

module.exports = router;