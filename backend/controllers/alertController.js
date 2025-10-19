const Alert = require('../models/Alert');
const Inventory = require('../models/Inventory');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Configure email transporter (using Gmail for example)
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// @desc    Generate alerts for low stock items
exports.generateAlerts = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid }).select('activeSheets email name');
    
    // Build query for active inventory
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

    let alertsCreated = 0;
    const newAlerts = [];

    // Scan inventory for low stock items
    for (const inv of inventory) {
      for (const item of inv.data) {
        const quantity = item.quantity || 0;
        const threshold = item.lowStockThreshold || 10; // Default threshold

        // Determine alert type
        let alertType = null;
        if (quantity === 0) {
          alertType = 'out-of-stock';
        } else if (quantity < threshold && quantity < 5) {
          alertType = 'critical';
        } else if (quantity < threshold) {
          alertType = 'low-stock';
        }

        // If alert condition met, check if alert already exists
        if (alertType) {
          const existingAlert = await Alert.findOne({
            userId: req.user.uid,
            sku: item.sku || item.productName,
            status: 'active',
          });

          if (!existingAlert) {
            const alert = await Alert.create({
              userId: req.user.uid,
              productName: item.productName,
              sku: item.sku,
              currentQuantity: quantity,
              threshold: threshold,
              category: item.category,
              alertType: alertType,
              sourceType: inv.sourceType,
              sourceId: inv.sourceId,
            });

            newAlerts.push(alert);
            alertsCreated++;
          }
        }
      }
    }

    // Send email notification if new alerts created
    if (alertsCreated > 0) {
      try {
        await sendAlertEmail(user, newAlerts);
      } catch (emailError) {
        console.error('Failed to send alert email:', emailError);
      }
    }

    res.status(200).json({
      success: true,
      message: `Generated ${alertsCreated} new alerts`,
      alertsCreated,
    });

  } catch (error) {
    console.error('Generate alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate alerts',
    });
  }
};

// @desc    Get all alerts
exports.getAlerts = async (req, res) => {
  try {
    const { status = 'active' } = req.query;

    const query = { userId: req.user.uid };
    if (status !== 'all') {
      query.status = status;
    }

    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    const stats = {
      total: alerts.length,
      critical: alerts.filter(a => a.alertType === 'critical' && a.status === 'active').length,
      lowStock: alerts.filter(a => a.alertType === 'low-stock' && a.status === 'active').length,
      outOfStock: alerts.filter(a => a.alertType === 'out-of-stock' && a.status === 'active').length,
    };

    res.status(200).json({
      success: true,
      alerts,
      stats,
    });

  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts',
    });
  }
};

// @desc    Update alert status
exports.updateAlertStatus = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { status } = req.body;

    const alert = await Alert.findOneAndUpdate(
      { _id: alertId, userId: req.user.uid },
      {
        status,
        resolvedAt: status === 'resolved' ? new Date() : null,
      },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Alert updated successfully',
      alert,
    });

  } catch (error) {
    console.error('Update alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update alert',
    });
  }
};

// @desc    Dismiss all alerts
exports.dismissAllAlerts = async (req, res) => {
  try {
    await Alert.updateMany(
      { userId: req.user.uid, status: 'active' },
      { status: 'dismissed' }
    );

    res.status(200).json({
      success: true,
      message: 'All alerts dismissed',
    });

  } catch (error) {
    console.error('Dismiss alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to dismiss alerts',
    });
  }
};

// Helper function to send email alerts
const sendAlertEmail = async (user, alerts) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('Email not configured, skipping alert email');
    return;
  }

  const transporter = createEmailTransporter();

  const criticalAlerts = alerts.filter(a => a.alertType === 'critical' || a.alertType === 'out-of-stock');
  const lowStockAlerts = alerts.filter(a => a.alertType === 'low-stock');

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .alert-item { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #ef4444; border-radius: 5px; }
        .critical { border-left-color: #dc2626; }
        .low-stock { border-left-color: #f59e0b; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 Low Stock Alert</h1>
          <p>Finxan AI Inventory Management</p>
        </div>
        <div class="content">
          <p>Hi ${user.name},</p>
          <p>We detected ${alerts.length} items that need your attention:</p>
          
          ${criticalAlerts.length > 0 ? `
            <h3 style="color: #dc2626;">⚠️ Critical Alerts (${criticalAlerts.length})</h3>
            ${criticalAlerts.map(alert => `
              <div class="alert-item critical">
                <strong>${alert.productName}</strong><br>
                SKU: ${alert.sku || 'N/A'}<br>
                Current Stock: <strong style="color: #dc2626;">${alert.currentQuantity}</strong> units<br>
                Status: ${alert.alertType === 'out-of-stock' ? 'OUT OF STOCK' : 'CRITICAL LOW'}
              </div>
            `).join('')}
          ` : ''}
          
          ${lowStockAlerts.length > 0 ? `
            <h3 style="color: #f59e0b;">📦 Low Stock Items (${lowStockAlerts.length})</h3>
            ${lowStockAlerts.map(alert => `
              <div class="alert-item low-stock">
                <strong>${alert.productName}</strong><br>
                SKU: ${alert.sku || 'N/A'}<br>
                Current Stock: <strong style="color: #f59e0b;">${alert.currentQuantity}</strong> units<br>
                Threshold: ${alert.threshold} units
              </div>
            `).join('')}
          ` : ''}
          
          <center>
            <a href="http://localhost:5173/alerts" class="button">View All Alerts</a>
          </center>
          
          <p>Please take action to restock these items to avoid stockouts.</p>
        </div>
        <div class="footer">
          <p>This is an automated alert from Finxan AI</p>
          <p>&copy; 2025 Finxan AI. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Finxan AI" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `🚨 Low Stock Alert - ${alerts.length} Items Need Attention`,
    html: emailHtml,
  };

  await transporter.sendMail(mailOptions);

  // Mark alerts as email sent
  await Alert.updateMany(
    { _id: { $in: alerts.map(a => a._id) } },
    { emailSent: true, emailSentAt: new Date() }
  );

  console.log(`Alert email sent to ${user.email}`);
};

module.exports = {
  generateAlerts: exports.generateAlerts,
  getAlerts: exports.getAlerts,
  updateAlertStatus: exports.updateAlertStatus,
  dismissAllAlerts: exports.dismissAllAlerts,
};
