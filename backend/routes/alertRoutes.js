const express = require('express');
const router = express.Router();
const {
  generateAlerts,
  getAlerts,
  updateAlertStatus,
  dismissAllAlerts,
} = require('../controllers/alertController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/alerts/generate
// @desc    Generate alerts for low stock items
// @access  Private
router.post('/generate', protect, generateAlerts);

// @route   GET /api/alerts
// @desc    Get all alerts
// @access  Private
router.get('/', protect, getAlerts);

// @route   PATCH /api/alerts/:alertId
// @desc    Update alert status
// @access  Private
router.patch('/:alertId', protect, updateAlertStatus);

// @route   POST /api/alerts/dismiss-all
// @desc    Dismiss all active alerts
// @access  Private
router.post('/dismiss-all', protect, dismissAllAlerts);

module.exports = router;
