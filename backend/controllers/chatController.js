const axios = require('axios');
const Inventory = require('../models/Inventory');
const User = require('../models/User');
const Chat = require('../models/Chat');

// Helper function to get inventory context from ACTIVE sheets only
const getInventoryContext = async (userId) => {
  try {
    // Get user's active sheets
    const user = await User.findOne({ firebaseUid: userId }).select('activeSheets');
    
    let inventoryDocs;
    
    if (user?.activeSheets && user.activeSheets.length > 0) {
      // Get data ONLY from active sheets
      const activeSourceIds = user.activeSheets.map(s => s.sourceId);
      inventoryDocs = await Inventory.find({ 
        userId,
        sourceId: { $in: activeSourceIds }
      }).populate('fileId');
    } else {
      // Fallback: If no active sheets, use uploaded files only
      inventoryDocs = await Inventory.find({ 
        userId,
        sourceType: { $ne: 'google-sheet' }
      }).populate('fileId');
    }
    
    if (!inventoryDocs || inventoryDocs.length === 0) {
      return {
        hasData: false,
        message: "No inventory data found. Please upload a file or activate a connected sheet.",
        summary: "No data available"
      };
    }

    // Flatten all items from active sources
    let allItems = [];
    inventoryDocs.forEach(inv => {
      if (inv.data && Array.isArray(inv.data)) {
        allItems = allItems.concat(inv.data);
      }
    });

    if (allItems.length === 0) {
      return {
        hasData: false,
        message: "No inventory items found in active sources.",
        summary: "No items available"
      };
    }

    // Calculate statistics
    const totalItems = allItems.length;
    const totalValue = allItems.reduce((sum, item) => 
      sum + ((item.quantity || 0) * (item.price || 0)), 0
    );
    const lowStockItems = allItems.filter(item => 
      item.status === 'low-stock' || item.status === 'out-of-stock'
    );
    
    // Get unique categories
    const categories = [...new Set(allItems.map(item => item.category).filter(Boolean))];
    
    // Category breakdown
    const categoryBreakdown = {};
    allItems.forEach(item => {
      const cat = item.category || 'Uncategorized';
      if (!categoryBreakdown[cat]) {
        categoryBreakdown[cat] = { count: 0, value: 0 };
      }
      categoryBreakdown[cat].count++;
      categoryBreakdown[cat].value += (item.quantity || 0) * (item.price || 0);
    });

    // Create summary for AI
    const summary = `
Inventory Summary:
- Total Products: ${totalItems}
- Total Value: $${totalValue.toFixed(2)}
- Low Stock Items: ${lowStockItems.length}
- Categories: ${categories.length} (${categories.join(', ')})

Category Breakdown:
${Object.entries(categoryBreakdown).map(([cat, data]) => 
  `- ${cat}: ${data.count} items, $${data.value.toFixed(2)}`
).join('\n')}

Top 10 Products:
${allItems.slice(0, 10).map(item => 
  `- ${item.productName || 'Unknown'}: ${item.quantity || 0} units @ $${(item.price || 0).toFixed(2)} (${item.status || 'in-stock'})`
).join('\n')}

Low Stock Items (${lowStockItems.length}):
${lowStockItems.slice(0, 5).map(item => 
  `- ${item.productName || 'Unknown'}: ${item.quantity || 0} units (${item.status})`
).join('\n')}
    `;

    return {
      hasData: true,
      totalItems,
      totalValue,
      lowStockCount: lowStockItems.length,
      categories,
      categoryBreakdown,
      items: allItems,
      summary: summary.trim()
    };

  } catch (error) {
    console.error('Error getting inventory context:', error);
    return {
      hasData: false,
      message: "Error fetching inventory data",
      error: error.message,
      summary: "Error loading data"
    };
  }
};

// @desc    Send message to AI
exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.uid;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    console.log(`✉️ AI Chat - User ${userId}: ${message}`);

    // Get inventory context
    const inventoryContext = await getInventoryContext(userId);
    
    if (!inventoryContext.hasData) {
      console.log('⚠️ No inventory data available for user');
    } else {
      console.log(`✅ Loaded ${inventoryContext.totalItems} items for context`);
    }

    // Get chat history (last 10 messages for context)
    const chatHistory = await Chat.find({ userId })
      .sort({ timestamp: -1 })
      .limit(10);

    const conversationHistory = chatHistory.reverse().map(chat => ({
      role: chat.role,
      content: chat.message
    }));

    // Call AI service
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    
    console.log(`🤖 Calling AI service at: ${aiServiceUrl}/chat`);

    const aiResponse = await axios.post(`${aiServiceUrl}/chat`, {
      message: message.trim(),
      inventory_context: inventoryContext.hasData ? {
        summary: inventoryContext.summary,
        total_items: inventoryContext.totalItems,
        total_value: inventoryContext.totalValue,
        low_stock_count: inventoryContext.lowStockCount,
        categories: inventoryContext.categories,
        has_data: true
      } : {
        summary: inventoryContext.message || "No inventory data available",
        has_data: false
      },
      conversation_history: conversationHistory
    }, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const aiMessage = aiResponse.data.response;

    // Save user message to database
    await Chat.create({
      userId,
      role: 'user',
      message: message.trim(),
      sessionId: 'default'
    });

    // Save AI response to database
    await Chat.create({
      userId,
      role: 'assistant',
      message: aiMessage,
      sessionId: 'default'
    });

    console.log('✅ AI response saved successfully');

    res.status(200).json({
      success: true,
      message: aiMessage,
      hasInventoryData: inventoryContext.hasData
    });

  } catch (error) {
    console.error('❌ Chat error:', error.response?.data || error.message);
    
    // More specific error messages
    let errorMessage = 'Failed to get AI response';
    
    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'AI service is not running. Please start the AI service on port 8000.';
    } else if (error.response?.status === 500) {
      errorMessage = 'AI service error. Please check the AI service logs.';
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get chat history
exports.getChatHistory = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { sessionId } = req.params;
    const { limit = 50 } = req.query;

    // If sessionId is provided, filter by it
    const query = { userId };
    if (sessionId && sessionId !== 'default') {
      query.sessionId = sessionId;
    }

    const chatHistory = await Chat.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      messages: chatHistory.reverse()
    });

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history'
    });
  }
};

// @desc    Create new chat session
exports.createNewSession = async (req, res) => {
  try {
    const userId = req.user.uid;

    // For now, we're using a single session per user
    // In future, you can implement multiple sessions

    res.status(200).json({
      success: true,
      message: 'Session created',
      sessionId: 'default'
    });

  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create session'
    });
  }
};

// @desc    Delete chat session
exports.deleteSession = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { sessionId } = req.params;

    // Delete all messages for this session
    const query = { userId };
    if (sessionId && sessionId !== 'default') {
      query.sessionId = sessionId;
    }

    const result = await Chat.deleteMany(query);

    console.log(`🗑️ Deleted ${result.deletedCount} messages for user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Chat history cleared successfully',
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete session'
    });
  }
};
