const express = require('express');
const router = express.Router();
const { 
  getInventory,
  getInventoryStats,
  updateInventoryItem,
  deleteInventoryItem,
  getLowStockItems
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/inventory
// @desc    Get all inventory items
// @access  Private
router.get('/', protect, getInventory);

// @route   GET /api/inventory/stats
// @desc    Get inventory statistics
// @access  Private
router.get('/stats', protect, getInventoryStats);

// @route   GET /api/inventory/low-stock
// @desc    Get low stock items
// @access  Private
router.get('/low-stock', protect, getLowStockItems);

// @route   PUT /api/inventory/:id
// @desc    Update inventory item
// @access  Private
router.put('/:id', protect, updateInventoryItem);

// @route   DELETE /api/inventory/:id
// @desc    Delete inventory item
// @access  Private
router.delete('/:id', protect, deleteInventoryItem);

module.exports = router;
