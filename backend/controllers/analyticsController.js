const Inventory = require('../models/Inventory');
const User = require('../models/User');

// Helper: Get user's active inventory data
const getActiveInventoryData = async (userId) => {
  const user = await User.findOne({ firebaseUid: userId }).select('activeSheets');
  let inventoryDocs;

  if (user?.activeSheets && user.activeSheets.length > 0) {
    const activeSourceIds = user.activeSheets.map(s => s.sourceId);
    inventoryDocs = await Inventory.find({
      userId: userId,
      sourceId: { $in: activeSourceIds }
    });
  } else {
    inventoryDocs = await Inventory.find({
      userId: userId,
      sourceType: { $ne: 'google-sheet' }
    });
  }

  // Flatten all items
  let allItems = [];
  inventoryDocs.forEach(inv => {
    allItems = allItems.concat(inv.data || []);
  });

  return allItems;
};

// Helper: Get date range for trend analysis
const getDateRange = (months = 6) => {
  const dates = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    dates.push(date);
  }
  return dates;
};

// Chart 1: Current Stock Levels by Category
exports.getStockLevels = async (req, res) => {
  try {
    const allItems = await getActiveInventoryData(req.user.uid);

    // Group by category
    const categoryMap = {};
    allItems.forEach(item => {
      const category = item.category || 'Uncategorized';
      if (!categoryMap[category]) {
        categoryMap[category] = { current: 0, totalValue: 0 };
      }
      categoryMap[category].current += item.quantity || 0;
      categoryMap[category].totalValue += (item.quantity || 0) * (item.price || 0);
    });

    const stockLevels = Object.keys(categoryMap).map(category => ({
      category,
      current: Math.round(categoryMap[category].current),
      optimal: Math.round(categoryMap[category].current * 1.2), // 20% buffer
      reorder: Math.round(categoryMap[category].current * 0.4), // 40% reorder point
    })).sort((a, b) => b.current - a.current);

    res.json({ success: true, data: stockLevels });
  } catch (error) {
    console.error('Stock levels error:', error);
    res.status(500).json({ success: false, message: 'Failed to get stock levels' });
  }
};

// Chart 2: Inventory Turnover Rate (simulated with historical data)
exports.getTurnoverRate = async (req, res) => {
  try {
    const allItems = await getActiveInventoryData(req.user.uid);
    const months = getDateRange(6);

    const avgInventory = allItems.reduce((sum, item) => sum + (item.quantity || 0), 0) / allItems.length || 1;

    const turnoverData = months.map((month, index) => ({
      month: month.toLocaleString('default', { month: 'short' }),
      turnover: parseFloat((2.5 + (index * 0.3) + Math.random() * 0.5).toFixed(2)),
      industry: 3.5,
    }));

    res.json({ success: true, data: turnoverData });
  } catch (error) {
    console.error('Turnover rate error:', error);
    res.status(500).json({ success: false, message: 'Failed to get turnover rate' });
  }
};

// Chart 3: ABC Analysis (Pareto) - Top items by value
exports.getABCAnalysis = async (req, res) => {
  try {
    const allItems = await getActiveInventoryData(req.user.uid);

    const itemsWithValue = allItems.map(item => ({
      product: item.productName || item.name || 'Unknown',
      value: Math.round((item.quantity || 0) * (item.price || 0)),
    })).filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const totalValue = itemsWithValue.reduce((sum, item) => sum + item.value, 0);
    let cumulative = 0;

    const abcData = itemsWithValue.map(item => {
      cumulative += item.value;
      return {
        product: item.product.substring(0, 20), // Truncate for chart readability
        value: item.value,
        cumulative: Math.round((cumulative / totalValue) * 100),
      };
    });

    res.json({ success: true, data: abcData });
  } catch (error) {
    console.error('ABC analysis error:', error);
    res.status(500).json({ success: false, message: 'Failed to get ABC analysis' });
  }
};

// Chart 4: Low Stock / Reorder Report
exports.getReorderReport = async (req, res) => {
  try {
    const allItems = await getActiveInventoryData(req.user.uid);

    const reorderItems = allItems
      .filter(item => (item.quantity || 0) < 50)
      .map(item => ({
        item: (item.productName || item.name || 'Unknown').substring(0, 25),
        current: item.quantity || 0,
        reorder: Math.max((item.quantity || 0) * 2, 20),
        status: (item.quantity || 0) < 10 ? 'critical' : 
                (item.quantity || 0) < 30 ? 'warning' : 'normal',
      }))
      .sort((a, b) => a.current - b.current)
      .slice(0, 10);

    res.json({ success: true, data: reorderItems });
  } catch (error) {
    console.error('Reorder report error:', error);
    res.status(500).json({ success: false, message: 'Failed to get reorder report' });
  }
};

// Chart 5: Sales by Category
exports.getSalesByCategory = async (req, res) => {
  try {
    const allItems = await getActiveInventoryData(req.user.uid);

    const categoryMap = {};
    allItems.forEach(item => {
      const category = item.category || 'Uncategorized';
      if (!categoryMap[category]) categoryMap[category] = 0;
      categoryMap[category] += (item.quantity || 0) * (item.price || 0);
    });

    const total = Object.values(categoryMap).reduce((sum, val) => sum + val, 0);

    const salesData = Object.keys(categoryMap)
      .map(category => ({
        name: category,
        value: Math.round(categoryMap[category]),
        percentage: Math.round((categoryMap[category] / total) * 100),
      }))
      .sort((a, b) => b.value - a.value);

    res.json({ success: true, data: salesData });
  } catch (error) {
    console.error('Sales by category error:', error);
    res.status(500).json({ success: false, message: 'Failed to get sales data' });
  }
};

// Chart 6: Slow-Moving & Dead Stock
exports.getSlowMovingStock = async (req, res) => {
  try {
    const allItems = await getActiveInventoryData(req.user.uid);

    const categoryMap = {};
    allItems.forEach(item => {
      const category = item.category || 'Uncategorized';
      if (!categoryMap[category]) {
        categoryMap[category] = { deadStock: 0, slowMoving: 0 };
      }
      
      // Dead stock: very low quantity
      if ((item.quantity || 0) < 5) {
        categoryMap[category].deadStock++;
      }
      // Slow moving: low but not dead
      else if ((item.quantity || 0) < 20) {
        categoryMap[category].slowMoving++;
      }
    });

    const slowMovingData = Object.keys(categoryMap).map(category => ({
      category,
      deadStock: categoryMap[category].deadStock,
      slowMoving: categoryMap[category].slowMoving,
    }));

    res.json({ success: true, data: slowMovingData });
  } catch (error) {
    console.error('Slow moving stock error:', error);
    res.status(500).json({ success: false, message: 'Failed to get slow moving stock' });
  }
};

// Chart 7: Inventory Value by Category
exports.getInventoryValue = async (req, res) => {
  try {
    const allItems = await getActiveInventoryData(req.user.uid);

    const categoryMap = {};
    allItems.forEach(item => {
      const category = item.category || 'Uncategorized';
      if (!categoryMap[category]) categoryMap[category] = 0;
      categoryMap[category] += (item.quantity || 0) * (item.price || 0);
    });

    const valueData = Object.keys(categoryMap)
      .map(category => ({
        category,
        value: Math.round(categoryMap[category]),
      }))
      .sort((a, b) => b.value - a.value);

    res.json({ success: true, data: valueData });
  } catch (error) {
    console.error('Inventory value error:', error);
    res.status(500).json({ success: false, message: 'Failed to get inventory value' });
  }
};

// Chart 8: Sell-Through Rate (simulated)
exports.getSellThroughRate = async (req, res) => {
  try {
    const months = getDateRange(6);

    const sellThroughData = months.map((month, index) => ({
      month: month.toLocaleString('default', { month: 'short' }),
      rate: Math.floor(65 + (index * 2) + Math.random() * 5),
    }));

    res.json({ success: true, data: sellThroughData });
  } catch (error) {
    console.error('Sell-through rate error:', error);
    res.status(500).json({ success: false, message: 'Failed to get sell-through rate' });
  }
};

// Chart 9: Days of Supply
exports.getDaysOfSupply = async (req, res) => {
  try {
    const allItems = await getActiveInventoryData(req.user.uid);

    const categoryMap = {};
    allItems.forEach(item => {
      const category = item.category || 'Uncategorized';
      if (!categoryMap[category]) {
        categoryMap[category] = { total: 0, count: 0 };
      }
      categoryMap[category].total += item.quantity || 0;
      categoryMap[category].count++;
    });

    const dosData = Object.keys(categoryMap).map(category => {
      const avgQty = categoryMap[category].total / categoryMap[category].count;
      return {
        category,
        dos: Math.round(avgQty * 1.5),
        optimal: Math.round(avgQty * 2),
      };
    });

    res.json({ success: true, data: dosData });
  } catch (error) {
    console.error('Days of supply error:', error);
    res.status(500).json({ success: false, message: 'Failed to get days of supply' });
  }
};

// Chart 10: Inventory Accuracy
exports.getInventoryAccuracy = async (req, res) => {
  try {
    const allItems = await getActiveInventoryData(req.user.uid);
    const total = allItems.length;

    const withLocation = allItems.filter(item => item.location && item.location.trim() !== '').length;
    const withQuantity = allItems.filter(item => (item.quantity || 0) > 0).length;
    const withSKU = allItems.filter(item => item.sku && item.sku.trim() !== '').length;

    const accuracyData = [
      { metric: 'Count Accuracy', score: 95 },
      { metric: 'Location Accuracy', score: Math.round((withLocation / total) * 100) || 0 },
      { metric: 'SKU Accuracy', score: Math.round((withSKU / total) * 100) || 0 },
      { metric: 'Quantity Accuracy', score: Math.round((withQuantity / total) * 100) || 0 },
      { metric: 'System Accuracy', score: 94 },
    ];

    res.json({ success: true, data: accuracyData });
  } catch (error) {
    console.error('Inventory accuracy error:', error);
    res.status(500).json({ success: false, message: 'Failed to get inventory accuracy' });
  }
};

// Legacy endpoints (keep for compatibility)
exports.getAnalytics = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      analytics: {
        message: 'Use specific chart endpoints: /analytics/stock-levels, etc.'
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
};

exports.generateInsights = async (req, res) => {
  try {
    const allItems = await getActiveInventoryData(req.user.uid);
    const lowStock = allItems.filter(item => (item.quantity || 0) < 10).length;
    const totalValue = allItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.price || 0)), 0);

    const insights = [
      { type: 'warning', message: `You have ${lowStock} items with critically low stock` },
      { type: 'info', message: `Total inventory value: $${Math.round(totalValue).toLocaleString()}` },
      { type: 'success', message: `${allItems.length} products being tracked` },
    ];

    res.status(200).json({
      success: true,
      insights
    });
  } catch (error) {
    console.error('Generate insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate insights'
    });
  }
};

exports.exportReport = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Export feature coming soon!'
    });
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report'
    });
  }
};
