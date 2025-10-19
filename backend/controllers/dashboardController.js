const Inventory = require('../models/Inventory');
const File = require('../models/File');
const User = require('../models/User');

// @desc    Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Get user's active sheets
    const user = await User.findOne({ firebaseUid: req.user.uid }).select('activeSheets');
    
    let inventoryDocs;
    
    if (user?.activeSheets && user.activeSheets.length > 0) {
      const activeSourceIds = user.activeSheets.map(s => s.sourceId);
      inventoryDocs = await Inventory.find({ 
        userId: req.user.uid,
        sourceId: { $in: activeSourceIds }
      });
    } else {
      inventoryDocs = await Inventory.find({ 
        userId: req.user.uid,
        sourceType: { $ne: 'google-sheet' }
      });
    }

    // Get all files (not filtered by active sheets)
    const files = await File.find({ userId: req.user.uid });

    // Flatten items
    let allItems = [];
    inventoryDocs.forEach(inv => {
      allItems = allItems.concat(inv.data || []);
    });

    // Calculate stats
    const totalProducts = allItems.length;
    const totalValue = allItems.reduce((sum, item) => 
      sum + ((item.quantity || 0) * (item.price || 0)), 0
    );
    const lowStockItems = allItems.filter(item => item.status === 'low-stock');
    const categories = [...new Set(allItems.map(item => item.category).filter(Boolean))];

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalValue,
        lowStockCount: lowStockItems.length,
        categoriesCount: categories.length,
        filesCount: files.length,
        activeSheets: user?.activeSheets?.length || 0,
      },
      lowStockItems: lowStockItems.slice(0, 5), // Top 5 low stock items
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard stats' 
    });
  }
};
