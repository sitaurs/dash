const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getStats, getOverallStats } = require('../controllers/statsController');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/stats/overall
router.get('/overall', getOverallStats);

// GET /api/stats/:period
router.get('/:period', getStats);

module.exports = router;