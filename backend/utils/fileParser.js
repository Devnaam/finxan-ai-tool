const xlsx = require('xlsx');
const pdfParse = require('pdf-parse');
const csv = require('csv-parser');
const fs = require('fs');

// Parse Excel file
exports.parseExcel = async (filePath) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Normalize data structure
    return data.map(row => normalizeInventoryData(row));

  } catch (error) {
    console.error('Excel parse error:', error);
    throw new Error('Failed to parse Excel file');
  }
};

// Parse CSV file
exports.parseCSV = async (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(normalizeInventoryData(data)))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

// Parse PDF file (basic text extraction)
exports.parsePDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    
    // Basic parsing - split by lines and attempt to extract structured data
    const lines = pdfData.text.split('\n').filter(line => line.trim());
    
    // TODO: Implement more sophisticated PDF table extraction
    // For now, return basic text data
    return [{
      rawText: pdfData.text,
      pageCount: pdfData.numpages,
      info: pdfData.info
    }];

  } catch (error) {
    console.error('PDF parse error:', error);
    throw new Error('Failed to parse PDF file');
  }
};

// Normalize inventory data from different sources
const normalizeInventoryData = (row) => {
  // Try to map common column names to standard fields
  const normalized = {
    productName: row['Product Name'] || row['product'] || row['name'] || row['item'] || '',
    sku: row['SKU'] || row['sku'] || row['code'] || '',
    category: row['Category'] || row['category'] || row['type'] || '',
    quantity: parseInt(row['Quantity'] || row['quantity'] || row['stock'] || 0),
    price: parseFloat(row['Price'] || row['price'] || row['cost'] || 0),
    supplier: row['Supplier'] || row['supplier'] || row['vendor'] || '',
    location: row['Location'] || row['location'] || row['warehouse'] || '',
    customFields: {}
  };

  // Determine status based on quantity
  if (normalized.quantity === 0) {
    normalized.status = 'out-of-stock';
  } else if (normalized.quantity < 10) {
    normalized.status = 'low-stock';
  } else {
    normalized.status = 'in-stock';
  }

  // Store any additional fields in customFields
  Object.keys(row).forEach(key => {
    const standardFields = ['Product Name', 'product', 'name', 'item', 'SKU', 'sku', 
                           'Category', 'category', 'Quantity', 'quantity', 'Price', 'price'];
    if (!standardFields.includes(key)) {
      normalized.customFields[key] = row[key];
    }
  });

  return normalized;
};
