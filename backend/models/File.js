const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['excel', 'pdf', 'csv', 'google-sheet'],
    required: true
  },
  fileSize: {
    type: Number
  },
  filePath: {
    type: String
  },
  cloudStorageUrl: {
    type: String
  },
  metadata: {
    rows: Number,
    columns: Number,
    sheets: [String]
  },
  status: {
    type: String,
    enum: ['uploading', 'processing', 'completed', 'failed'],
    default: 'uploading'
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('File', fileSchema);
