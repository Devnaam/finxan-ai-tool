const express = require('express');
const router = express.Router();
const { 
  getAnalytics,
  generateInsights,
  exportReport
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/analytics
// @desc    Get analytics data
// @access  Private
router.get('/', protect, getAnalytics);

// @route   POST /api/analytics/insights
// @desc    Generate AI-powered insights
// @access  Private
router.post('/insights', protect, generateInsights);

// @route   GET /api/analytics/export
// @desc    Export analytics report
// @access  Private
router.get('/export', protect, exportReport);

module.exports = router;
