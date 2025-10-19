const File = require('../models/File');
const User = require('../models/User');
const path = require('path');
const fs = require('fs').promises;
const { parseExcel, parsePDF, parseCSV } = require('../utils/fileParser');

// @desc    Upload file
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const { originalname, mimetype, size, path: filePath } = req.file;

    // Determine file type
    let fileType;
    if (mimetype.includes('spreadsheet') || originalname.endsWith('.xlsx') || originalname.endsWith('.xls')) {
      fileType = 'excel';
    } else if (mimetype === 'application/pdf') {
      fileType = 'pdf';
    } else if (mimetype === 'text/csv' || originalname.endsWith('.csv')) {
      fileType = 'csv';
    } else {
      // Delete uploaded file if not supported
      await fs.unlink(filePath);
      return res.status(400).json({ 
        success: false, 
        message: 'Unsupported file type. Only Excel, PDF, and CSV are allowed.' 
      });
    }

    // Create file record
    const file = await File.create({
      userId: req.user.uid,
      fileName: originalname,
      fileType,
      fileSize: size,
      filePath,
      status: 'processing'
    });

    // Add file to user's uploadedFiles
    await User.findOneAndUpdate(
      { firebaseUid: req.user.uid },
      { $push: { uploadedFiles: file._id } }
    );

    // Parse file in background (we'll implement this next)
    parseFileInBackground(file);

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        id: file._id,
        fileName: file.fileName,
        fileType: file.fileType,
        status: file.status
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'File upload failed' 
    });
  }
};

// Background file parsing
const parseFileInBackground = async (file) => {
  try {
    let parsedData;
    
    if (file.fileType === 'excel') {
      parsedData = await parseExcel(file.filePath);
    } else if (file.fileType === 'csv') {
      parsedData = await parseCSV(file.filePath);
    } else if (file.fileType === 'pdf') {
      parsedData = await parsePDF(file.filePath);
    }

    // Update file metadata
    file.metadata = {
      rows: parsedData.length,
      columns: parsedData[0] ? Object.keys(parsedData[0]).length : 0
    };
    file.status = 'completed';
    await file.save();

    // Store parsed data in Inventory collection
    const Inventory = require('../models/Inventory');
    await Inventory.create({
      userId: file.userId,
      fileId: file._id,
      sourceType: file.fileType,
      data: parsedData
    });

    console.log(`✅ File ${file.fileName} processed successfully`);

  } catch (error) {
    console.error('File parsing error:', error);
    file.status = 'failed';
    await file.save();
  }
};

// @desc    Get all user files
exports.getUserFiles = async (req, res) => {
  try {
    const files = await File.find({ userId: req.user.uid })
      .sort({ uploadedAt: -1 })
      .select('-filePath');

    res.status(200).json({
      success: true,
      count: files.length,
      files
    });

  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch files' 
    });
  }
};

// @desc    Get file by ID
exports.getFileById = async (req, res) => {
  try {
    const file = await File.findOne({ 
      _id: req.params.id, 
      userId: req.user.uid 
    });

    if (!file) {
      return res.status(404).json({ 
        success: false, 
        message: 'File not found' 
      });
    }

    res.status(200).json({
      success: true,
      file
    });

  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch file' 
    });
  }
};

// @desc    Delete file
exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findOne({ 
      _id: req.params.id, 
      userId: req.user.uid 
    });

    if (!file) {
      return res.status(404).json({ 
        success: false, 
        message: 'File not found' 
      });
    }

    // Delete file from disk
    if (file.filePath) {
      await fs.unlink(file.filePath).catch(err => console.error('File delete error:', err));
    }

    // Delete file record
    await file.deleteOne();

    // Remove from user's uploadedFiles
    await User.findOneAndUpdate(
      { firebaseUid: req.user.uid },
      { $pull: { uploadedFiles: file._id } }
    );

    // Delete associated inventory data
    const Inventory = require('../models/Inventory');
    await Inventory.deleteOne({ fileId: file._id });

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete file' 
    });
  }
};
