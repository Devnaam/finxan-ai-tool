const User = require('../models/User');
const Inventory = require('../models/Inventory');
const axios = require('axios');

// Helper function to normalize inventory data
const normalizeInventoryData = (row) => {
  const normalized = {
    productName: row.product_name || row.product || row.name || row.item || 'Unknown',
    sku: row.sku || row.code || '',
    category: row.category || row.type || 'Other',
    quantity: parseInt(row.quantity || row.stock || row.qty || 0),
    price: parseFloat(row.price || row.cost || 0),
    supplier: row.supplier || row.vendor || '',
    location: row.location || row.warehouse || '',
    customFields: {},
  };

  if (normalized.quantity === 0) {
    normalized.status = 'out-of-stock';
  } else if (normalized.quantity < 10) {
    normalized.status = 'low-stock';
  } else {
    normalized.status = 'in-stock';
  }

  return normalized;
};

// @desc    Preview Google Sheet (Get available sheets)
exports.previewGoogleSheet = async (req, res) => {
  try {
    const { spreadsheetId } = req.body;

    if (!spreadsheetId) {
      return res.status(400).json({
        success: false,
        message: 'Spreadsheet ID is required',
      });
    }

    const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Google Sheets API key not configured',
      });
    }

    const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${apiKey}`;
    const metadataResponse = await axios.get(metadataUrl);
    
    const sheets = metadataResponse.data.sheets;
    const spreadsheetTitle = metadataResponse.data.properties.title;

    if (!sheets || sheets.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No sheets found in this spreadsheet',
      });
    }

    const sheetsWithPreview = await Promise.all(
      sheets.map(async (sheet) => {
        try {
          const sheetName = sheet.properties.title;
          const dataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1:Z5?key=${apiKey}`;
          const dataResponse = await axios.get(dataUrl);
          
          const rows = dataResponse.data.values || [];
          const rowCount = sheet.properties.gridProperties.rowCount;
          const columnCount = sheet.properties.gridProperties.columnCount;
          
          return {
            sheetId: sheet.properties.sheetId,
            sheetName: sheetName,
            rowCount: rowCount,
            columnCount: columnCount,
            hasData: rows.length > 1,
            preview: rows.slice(0, 5),
            headers: rows[0] || [],
          };
        } catch (error) {
          return {
            sheetId: sheet.properties.sheetId,
            sheetName: sheet.properties.title,
            hasData: false,
            error: 'Unable to preview',
          };
        }
      })
    );

    res.status(200).json({
      success: true,
      spreadsheetId: spreadsheetId,
      spreadsheetTitle: spreadsheetTitle,
      sheets: sheetsWithPreview,
    });

  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({
      success: false,
      message: error.response?.data?.error?.message || 'Failed to preview sheets',
    });
  }
};

// @desc    Connect specific sheet
exports.connectSpecificSheet = async (req, res) => {
  try {
    const { spreadsheetId, sheetName, spreadsheetTitle } = req.body;

    if (!spreadsheetId || !sheetName) {
      return res.status(400).json({
        success: false,
        message: 'Spreadsheet ID and sheet name are required',
      });
    }

    const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
    const dataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}?key=${apiKey}`;
    const dataResponse = await axios.get(dataUrl);
    
    const rows = dataResponse.data.values;

    if (!rows || rows.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Sheet must have at least 2 rows (header + data)',
      });
    }

    const headers = rows[0].map(h => h.toString().trim().toLowerCase().replace(/\s+/g, '_'));
    const data = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return normalizeInventoryData(obj);
    });

    const sourceId = `${spreadsheetId}_${sheetName}`;

    // Check if already connected
    const user = await User.findOne({ firebaseUid: req.user.uid });
    const existingSheet = user?.connectedSheets?.find(
      s => s.sheetId === spreadsheetId && s.sheetName === sheetName
    );
    
    if (existingSheet) {
      await Inventory.findOneAndUpdate(
        { userId: req.user.uid, sourceId: sourceId },
        { data: data, lastSynced: new Date() }
      );

      return res.status(200).json({
        success: true,
        message: 'Sheet already connected. Data refreshed.',
        data: { rows: data.length, sheetName },
      });
    }

    // Save inventory
    await Inventory.create({
      userId: req.user.uid,
      sourceType: 'google-sheet',
      sourceId: sourceId,
      spreadsheetId: spreadsheetId,
      data: data,
      lastSynced: new Date(),
    });

    // Add to connected sheets
    await User.findOneAndUpdate(
      { firebaseUid: req.user.uid },
      {
        $push: {
          connectedSheets: {
            sheetId: spreadsheetId,
            sheetName: sheetName,
            spreadsheetTitle: spreadsheetTitle || 'Untitled',
            lastSynced: new Date(),
            rowCount: data.length,
          },
        },
      }
    );

    res.status(200).json({
      success: true,
      message: 'Sheet connected successfully',
      data: { rows: data.length, sheetName },
    });

  } catch (error) {
    console.error('Connect error:', error);
    res.status(500).json({
      success: false,
      message: error.response?.data?.error?.message || 'Failed to connect sheet',
    });
  }
};

// @desc    Get user's connected sheets
exports.getUserSheets = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid })
      .select('connectedSheets');

    res.status(200).json({
      success: true,
      sheets: user?.connectedSheets || [],
    });

  } catch (error) {
    console.error('Get sheets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sheets',
    });
  }
};

// @desc    Sync sheet (NEW ENDPOINT - body params)
exports.syncSheet = async (req, res) => {
  try {
    const { spreadsheetId, sheetName } = req.body;

    if (!spreadsheetId || !sheetName) {
      return res.status(400).json({
        success: false,
        message: 'Spreadsheet ID and sheet name are required',
      });
    }

    const user = await User.findOne({ firebaseUid: req.user.uid });
    const sheet = user.connectedSheets.find(
      s => s.sheetId === spreadsheetId && s.sheetName === sheetName
    );

    if (!sheet) {
      return res.status(404).json({
        success: false,
        message: 'Sheet not found in connected sheets',
      });
    }

    const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
    const dataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}?key=${apiKey}`;
    const dataResponse = await axios.get(dataUrl);
    const rows = dataResponse.data.values;

    if (!rows || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No data found in the sheet',
      });
    }

    const headers = rows[0].map(h => h.toString().trim().toLowerCase().replace(/\s+/g, '_'));
    const data = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return normalizeInventoryData(obj);
    });

    const sourceId = `${spreadsheetId}_${sheetName}`;

    // Update inventory
    await Inventory.findOneAndUpdate(
      { userId: req.user.uid, sourceId: sourceId },
      { data: data, lastSynced: new Date() },
      { upsert: true }
    );

    // Update user's connected sheets
    await User.findOneAndUpdate(
      {
        firebaseUid: req.user.uid,
        'connectedSheets.sheetId': spreadsheetId,
        'connectedSheets.sheetName': sheetName,
      },
      {
        $set: { 
          'connectedSheets.$.lastSynced': new Date(),
          'connectedSheets.$.rowCount': data.length,
        },
      }
    );

    console.log(`Sheet synced: ${sheetName} (${data.length} rows)`);

    res.status(200).json({
      success: true,
      message: 'Sheet synced successfully',
      rows: data.length,
    });

  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({
      success: false,
      message: error.response?.data?.error?.message || 'Failed to sync sheet',
    });
  }
};

// @desc    Disconnect sheet (NEW ENDPOINT - body params)
exports.disconnectSheet = async (req, res) => {
  try {
    const { spreadsheetId, sheetName } = req.body;

    if (!spreadsheetId || !sheetName) {
      return res.status(400).json({
        success: false,
        message: 'Spreadsheet ID and sheet name are required',
      });
    }

    const sourceId = `${spreadsheetId}_${sheetName}`;

    // Remove from connected sheets
    await User.findOneAndUpdate(
      { firebaseUid: req.user.uid },
      {
        $pull: {
          connectedSheets: { 
            sheetId: spreadsheetId,
            sheetName: sheetName 
          },
          activeSheets: {
            spreadsheetId: spreadsheetId,
            sheetName: sheetName
          },
        },
      }
    );

    // Delete inventory data
    await Inventory.deleteOne({
      userId: req.user.uid,
      sourceId: sourceId,
    });

    console.log(`Sheet disconnected: ${sheetName}`);

    res.status(200).json({
      success: true,
      message: 'Sheet disconnected successfully',
    });

  } catch (error) {
    console.error('Disconnect error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect sheet',
    });
  }
};

// @desc    Set sheet as active (add to active sheets)
exports.setActiveSheet = async (req, res) => {
  try {
    const { spreadsheetId, sheetName } = req.body;

    if (!spreadsheetId || !sheetName) {
      return res.status(400).json({
        success: false,
        message: 'Spreadsheet ID and sheet name are required',
      });
    }

    const sourceId = `${spreadsheetId}_${sheetName}`;

    // Check if already active
    const user = await User.findOne({ firebaseUid: req.user.uid });
    const alreadyActive = user.activeSheets?.some(
      s => s.spreadsheetId === spreadsheetId && s.sheetName === sheetName
    );

    if (alreadyActive) {
      return res.status(200).json({
        success: true,
        message: 'Sheet already active',
      });
    }

    // Add to active sheets
    await User.findOneAndUpdate(
      { firebaseUid: req.user.uid },
      {
        $addToSet: {
          activeSheets: {
            spreadsheetId: spreadsheetId,
            sheetName: sheetName,
            sourceId: sourceId,
          },
        },
      }
    );

    res.status(200).json({
      success: true,
      message: `"${sheetName}" activated`,
    });

  } catch (error) {
    console.error('Activate sheet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate sheet',
    });
  }
};

// @desc    Deactivate sheet (remove from active sheets)
exports.deactivateSheet = async (req, res) => {
  try {
    const { spreadsheetId, sheetName } = req.body;

    if (!spreadsheetId || !sheetName) {
      return res.status(400).json({
        success: false,
        message: 'Spreadsheet ID and sheet name are required',
      });
    }

    // Remove from active sheets
    await User.findOneAndUpdate(
      { firebaseUid: req.user.uid },
      {
        $pull: {
          activeSheets: {
            spreadsheetId: spreadsheetId,
            sheetName: sheetName,
          },
        },
      }
    );

    res.status(200).json({
      success: true,
      message: `"${sheetName}" deactivated`,
    });

  } catch (error) {
    console.error('Deactivate sheet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate sheet',
    });
  }
};

// @desc    Get active sheets
exports.getActiveSheets = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid })
      .select('activeSheets');

    res.status(200).json({
      success: true,
      activeSheets: user?.activeSheets || [],
    });

  } catch (error) {
    console.error('Get active sheets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get active sheets',
    });
  }
};
