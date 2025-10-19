const express = require('express');
const router = express.Router();
const { exportToExcel, exportToPDF } = require('../controllers/exportController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/export/excel
// @desc    Export inventory to Excel
// @access  Private
router.get('/excel', protect, exportToExcel);

// @route   GET /api/export/pdf
// @desc    Export inventory to PDF
// @access  Private
router.get('/pdf', protect, exportToPDF);

module.exports = router;
