const { google } = require('googleapis');
const path = require('path');

// Initialize Google Sheets API
const initGoogleSheets = (credentials) => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    return sheets;
  } catch (error) {
    console.error('Error initializing Google Sheets:', error);
    throw error;
  }
};

// Get OAuth2 client
const getOAuth2Client = () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  return oauth2Client;
};

// Generate auth URL
const generateAuthUrl = () => {
  const oauth2Client = getOAuth2Client();
  
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/spreadsheets.readonly',
      'https://www.googleapis.com/auth/drive.readonly'
    ],
  });

  return authUrl;
};

// Get tokens from code
const getTokensFromCode = async (code) => {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

// Read spreadsheet data
const readSpreadsheet = async (tokens, spreadsheetId, range = 'Sheet1') => {
  try {
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials(tokens);

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      return [];
    }

    // Convert to array of objects
    const headers = rows[0].map(header => 
      header.toString().trim().toLowerCase().replace(/\s+/g, '_')
    );
    
    const data = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });

    return data;

  } catch (error) {
    console.error('Error reading spreadsheet:', error);
    throw error;
  }
};

// Get spreadsheet metadata
const getSpreadsheetMetadata = async (tokens, spreadsheetId) => {
  try {
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials(tokens);

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    return {
      title: response.data.properties.title,
      sheetCount: response.data.sheets.length,
      sheets: response.data.sheets.map(sheet => ({
        name: sheet.properties.title,
        id: sheet.properties.sheetId,
      })),
    };

  } catch (error) {
    console.error('Error getting spreadsheet metadata:', error);
    throw error;
  }
};

module.exports = {
  initGoogleSheets,
  getOAuth2Client,
  generateAuthUrl,
  getTokensFromCode,
  readSpreadsheet,
  getSpreadsheetMetadata,
};
