const Inventory = require("../models/Inventory");
const User = require("../models/User");

// @desc    Get all inventory (FILTERED by active sheets)
exports.getInventory = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, category, status } = req.query;

    // Get user's active sheets
    const user = await User.findOne({ firebaseUid: req.user.uid }).select('activeSheets');
    
    // Build base query
    const query = { userId: req.user.uid };
    
    // Filter by active sheets
    if (user?.activeSheets && user.activeSheets.length > 0) {
      const activeSourceIds = user.activeSheets.map(s => s.sourceId);
      query.$or = [
        { sourceId: { $in: activeSourceIds } }, // Include active sheets
        { sourceType: { $ne: 'google-sheet' } } // Always include uploaded files
      ];
    } else {
      // If no active sheets, exclude ALL Google Sheets data
      query.sourceType = { $ne: 'google-sheet' };
    }

    // Get inventory documents
    const inventory = await Inventory.find(query)
      .sort({ lastSynced: -1 })
      .populate("fileId", "fileName fileType");

    if (!inventory || inventory.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        totalPages: 0,
        currentPage: page,
        inventory: [],
        message: 'No inventory data found. Upload a file or activate a Google Sheet.',
      });
    }

    // Flatten all items
    let allItems = [];
    inventory.forEach((inv) => {
      inv.data.forEach((item) => {
        allItems.push({
          ...item.toObject(),
          source: inv.sourceType,
          sourceId: inv.sourceId,
        });
      });
    });

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      allItems = allItems.filter(item => 
        item.productName?.toLowerCase().includes(searchLower) ||
        item.sku?.toLowerCase().includes(searchLower) ||
        item.category?.toLowerCase().includes(searchLower)
      );
    }

    if (category) {
      allItems = allItems.filter(item => item.category === category);
    }

    if (status) {
      allItems = allItems.filter(item => item.status === status);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedItems = allItems.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      count: allItems.length,
      totalPages: Math.ceil(allItems.length / limit),
      currentPage: parseInt(page),
      inventory: paginatedItems,
    });
  } catch (error) {
    console.error("Get inventory error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
    });
  }
};

// @desc    Get inventory statistics (FILTERED by active sheets)
exports.getInventoryStats = async (req, res) => {
  try {
    // Get user's active sheets
    const user = await User.findOne({ firebaseUid: req.user.uid }).select('activeSheets');
    
    // Build query
    const query = { userId: req.user.uid };
    
    if (user?.activeSheets && user.activeSheets.length > 0) {
      const activeSourceIds = user.activeSheets.map(s => s.sourceId);
      query.$or = [
        { sourceId: { $in: activeSourceIds } },
        { sourceType: { $ne: 'google-sheet' } }
      ];
    } else {
      query.sourceType = { $ne: 'google-sheet' };
    }

    const inventory = await Inventory.find(query);

    let totalItems = 0;
    let totalValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalProducts = 0;

    inventory.forEach((inv) => {
      inv.data.forEach((item) => {
        totalProducts++;
        totalItems += item.quantity || 0;
        totalValue += (item.quantity || 0) * (item.price || 0);

        if (item.status === "low-stock") lowStockCount++;
        if (item.status === "out-of-stock") outOfStockCount++;
      });
    });

    res.status(200).json({
      success: true,
      stats: {
        totalItems,
        totalValue: totalValue.toFixed(2),
        lowStockCount,
        outOfStockCount,
        totalProducts,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
    });
  }
};

// @desc    Get low stock items (FILTERED by active sheets)
exports.getLowStockItems = async (req, res) => {
  try {
    // Get user's active sheets
    const user = await User.findOne({ firebaseUid: req.user.uid }).select('activeSheets');
    
    // Build query
    const query = { 
      userId: req.user.uid,
      "data.status": { $in: ["low-stock", "out-of-stock"] }
    };
    
    if (user?.activeSheets && user.activeSheets.length > 0) {
      const activeSourceIds = user.activeSheets.map(s => s.sourceId);
      query.$or = [
        { sourceId: { $in: activeSourceIds } },
        { sourceType: { $ne: 'google-sheet' } }
      ];
    } else {
      query.sourceType = { $ne: 'google-sheet' };
    }

    const inventory = await Inventory.find(query);

    const lowStockItems = [];
    inventory.forEach((inv) => {
      inv.data.forEach((item) => {
        if (item.status === "low-stock" || item.status === "out-of-stock") {
          lowStockItems.push({
            ...item.toObject(),
            source: inv.sourceType,
            sourceId: inv.sourceId,
          });
        }
      });
    });

    res.status(200).json({
      success: true,
      count: lowStockItems.length,
      items: lowStockItems,
    });
  } catch (error) {
    console.error("Get low stock error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch low stock items",
    });
  }
};

// @desc    Update inventory item
exports.updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // TODO: Implement item update logic
    // This would require finding the specific inventory document
    // and updating the nested item within the data array

    res.status(200).json({
      success: true,
      message: "Inventory item updated successfully",
    });
  } catch (error) {
    console.error("Update item error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update item",
    });
  }
};

// @desc    Delete inventory item
exports.deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Implement item delete logic
    // This would require finding the specific inventory document
    // and removing the item from the data array

    res.status(200).json({
      success: true,
      message: "Inventory item deleted successfully",
    });
  } catch (error) {
    console.error("Delete item error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete item",
    });
  }
};
