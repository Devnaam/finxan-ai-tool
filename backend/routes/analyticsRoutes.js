const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  generateInsights,
  exportReport,
  // NEW: Chart-specific endpoints
  getStockLevels,
  getTurnoverRate,
  getABCAnalysis,
  getReorderReport,
  getSalesByCategory,
  getSlowMovingStock,
  getInventoryValue,
  getSellThroughRate,
  getDaysOfSupply,
  getInventoryAccuracy,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// Legacy routes
router.get('/', protect, getAnalytics);
router.post('/insights', protect, generateInsights);
router.get('/export', protect, exportReport);

// NEW: Chart-specific routes
router.get('/stock-levels', protect, getStockLevels);
router.get('/turnover-rate', protect, getTurnoverRate);
router.get('/abc-analysis', protect, getABCAnalysis);
router.get('/reorder-report', protect, getReorderReport);
router.get('/sales-by-category', protect, getSalesByCategory);
router.get('/slow-moving-stock', protect, getSlowMovingStock);
router.get('/inventory-value', protect, getInventoryValue);
router.get('/sell-through-rate', protect, getSellThroughRate);
router.get('/days-of-supply', protect, getDaysOfSupply);
router.get('/inventory-accuracy', protect, getInventoryAccuracy);

module.exports = router;
