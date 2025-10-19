const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  productName: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
  },
  currentQuantity: {
    type: Number,
    required: true,
  },
  threshold: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'dismissed'],
    default: 'active',
  },
  alertType: {
    type: String,
    enum: ['low-stock', 'out-of-stock', 'critical'],
    required: true,
  },
  emailSent: {
    type: Boolean,
    default: false,
  },
  emailSentAt: {
    type: Date,
  },
  resolvedAt: {
    type: Date,
  },
  sourceType: {
    type: String,
    enum: ['file', 'google-sheet'],
  },
  sourceId: {
    type: String,
  },
}, {
  timestamps: true,
});

// Index for faster queries
alertSchema.index({ userId: 1, status: 1 });
alertSchema.index({ userId: 1, alertType: 1 });

module.exports = mongoose.model('Alert', alertSchema);
