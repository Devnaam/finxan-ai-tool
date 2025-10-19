const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const Inventory = require('../models/Inventory');
const User = require('../models/User');

// @desc    Export inventory to Excel
exports.exportToExcel = async (req, res) => {
  try {
    // Get user's active sheets
    const user = await User.findOne({ firebaseUid: req.user.uid }).select('activeSheets name');
    
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

    // Flatten items
    let allItems = [];
    inventory.forEach((inv) => {
      inv.data.forEach((item) => {
        allItems.push({
          ...item.toObject(),
          source: inv.sourceType,
        });
      });
    });

    if (allItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No inventory data to export',
      });
    }

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventory');

    // Add title
    worksheet.mergeCells('A1:H1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `Finxan AI - Inventory Report (${new Date().toLocaleDateString()})`;
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Add headers
    worksheet.addRow([]);
    const headerRow = worksheet.addRow([
      'Product Name',
      'SKU',
      'Category',
      'Quantity',
      'Price',
      'Total Value',
      'Status',
      'Source',
    ]);

    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3B82F6' },
    };
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add data
    allItems.forEach((item) => {
      worksheet.addRow([
        item.productName || 'N/A',
        item.sku || 'N/A',
        item.category || 'Uncategorized',
        item.quantity || 0,
        parseFloat(item.price || 0).toFixed(2),
        ((item.quantity || 0) * (item.price || 0)).toFixed(2),
        item.status || 'in-stock',
        item.source === 'google-sheet' ? 'Google Sheet' : 'Uploaded File',
      ]);
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      column.width = 15;
    });

    // Add summary
    worksheet.addRow([]);
    const summaryRow = worksheet.addRow([
      'TOTAL',
      '',
      '',
      allItems.reduce((sum, item) => sum + (item.quantity || 0), 0),
      '',
      allItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.price || 0)), 0).toFixed(2),
      '',
      '',
    ]);
    summaryRow.font = { bold: true };
    summaryRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' },
    };

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=inventory-${Date.now()}.xlsx`
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Export to Excel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export to Excel',
    });
  }
};

// @desc    Export inventory to PDF
exports.exportToPDF = async (req, res) => {
  try {
    // Get user's active sheets
    const user = await User.findOne({ firebaseUid: req.user.uid }).select('activeSheets name');
    
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

    // Flatten items
    let allItems = [];
    inventory.forEach((inv) => {
      inv.data.forEach((item) => {
        allItems.push({
          ...item.toObject(),
          source: inv.sourceType,
        });
      });
    });

    if (allItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No inventory data to export',
      });
    }

    // Create PDF document
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=inventory-${Date.now()}.pdf`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Add title
    doc.fontSize(20).font('Helvetica-Bold').text('Finxan AI', { align: 'center' });
    doc.fontSize(16).text('Inventory Report', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(new Date().toLocaleDateString(), { align: 'center' });
    doc.moveDown(2);

    // Add summary stats
    const totalValue = allItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.price || 0)), 0);
    const totalItems = allItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

    doc.fontSize(12).font('Helvetica-Bold').text('Summary:', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text(`Total Products: ${allItems.length}`);
    doc.text(`Total Items: ${totalItems}`);
    doc.text(`Total Value: $${totalValue.toFixed(2)}`);
    doc.moveDown(1.5);

    // Add table header
    doc.fontSize(12).font('Helvetica-Bold').text('Inventory Details:', { underline: true });
    doc.moveDown(0.5);

    // Table
    const tableTop = doc.y;
    const itemHeight = 20;
    const pageHeight = doc.page.height - doc.page.margins.bottom;

    // Draw header
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Product', 50, tableTop, { width: 120, continued: false });
    doc.text('SKU', 170, tableTop, { width: 60, continued: false });
    doc.text('Qty', 230, tableTop, { width: 40, continued: false });
    doc.text('Price', 270, tableTop, { width: 60, continued: false });
    doc.text('Value', 330, tableTop, { width: 60, continued: false });
    doc.text('Status', 390, tableTop, { width: 80, continued: false });

    doc.moveTo(50, tableTop + 12).lineTo(550, tableTop + 12).stroke();

    let y = tableTop + 15;

    // Draw rows
    doc.fontSize(8).font('Helvetica');
    allItems.forEach((item, index) => {
      if (y > pageHeight - 50) {
        doc.addPage();
        y = 50;
      }

      const value = ((item.quantity || 0) * (item.price || 0)).toFixed(2);

      doc.text(item.productName || 'N/A', 50, y, { width: 120, continued: false });
      doc.text(item.sku || 'N/A', 170, y, { width: 60, continued: false });
      doc.text((item.quantity || 0).toString(), 230, y, { width: 40, continued: false });
      doc.text(`$${(item.price || 0).toFixed(2)}`, 270, y, { width: 60, continued: false });
      doc.text(`$${value}`, 330, y, { width: 60, continued: false });
      doc.text(item.status || 'in-stock', 390, y, { width: 80, continued: false });

      y += itemHeight;
    });

    // Add footer
    doc.fontSize(8).text(
      `Generated by Finxan AI - ${new Date().toLocaleString()}`,
      50,
      doc.page.height - 50,
      { align: 'center' }
    );

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Export to PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export to PDF',
    });
  }
};
