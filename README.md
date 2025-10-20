# 🚀 Finxan AI - Intelligent Inventory Management System

A modern, full-stack inventory management system with AI-powered insights, Google Sheets integration, and real-time analytics.

![Finxan AI](https://img.shields.io/badge/Finxan-AI-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

### 🎯 Core Features
- **Smart Dashboard** - Real-time analytics with 4 interactive charts
- **File Upload** - Support for Excel (XLSX), CSV, and PDF files
- **Google Sheets Integration** - Connect multiple sheets with two-way sync
- **AI Chat Assistant** - Powered by Gemini 2.0 Flash for intelligent insights
- **Inventory Management** - Complete CRUD operations with search & filters

### 🔔 Advanced Features
- **Low Stock Alerts** - Automatic email notifications
- **Export System** - Export to Excel, PDF, and CSV
- **Multi-Sheet Support** - Activate/deactivate specific sheets
- **Dark Mode** - Beautiful dark theme support
- **Responsive Design** - Works on all devices

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **React Router** for navigation
- **Firebase** for authentication

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **Firebase Admin SDK**
- **ExcelJS** for Excel generation
- **PDFKit** for PDF generation
- **Nodemailer** for email alerts

### AI Service
- **Python FastAPI**
- **Google Gemini 2.0 Flash API**
- **LangChain** for context management

## 📋 Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- MongoDB (local or Atlas)
- Firebase account
- Google Cloud account (for Sheets API & Gemini)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/finxan-ai.git
cd finxan-ai
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Add your environment variables to .env:
# PORT
# MONGO_URI
# FIREBASE_PROJECT_ID
# FIREBASE_PRIVATE_KEY
# FIREBASE_CLIENT_EMAIL
# GOOGLE_SHEETS_API_KEY
# EMAIL_USER
# EMAIL_PASSWORD

# Start backend
npm run backend
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Create .env file
cp .env.example .env

# Add your Firebase config to .env

# Start frontend
npm run dev
```

### 4. AI Service Setup

```bash
cd ai-service
python -m venv venv
source venv/bin/activate # On Windows: venv\Scripts\activate

pip install -r requirements.txt

# Create .env file with GEMINI_API_KEY

# Start AI service
uvicorn app:app --reload --port 8000
```

## 📁 Project Structure

```
finxan-ai/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── services/
│   └── index.html
├── ai-service/
│   ├── app.py
│   └── requirements.txt
└── README.md
```

## 🔑 Environment Variables

### Backend (.env)

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
GOOGLE_SHEETS_API_KEY=your_sheets_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### Frontend (.env)

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### AI Service (.env)

```
GEMINI_API_KEY=your_gemini_api_key
```

## 📸 Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Inventory Management
![Inventory](screenshots/inventory.png)

### AI Chat Assistant
![AI Chat](screenshots/ai-chat.png)

## 🎯 Key Features in Detail

### 1. Google Sheets Integration
- Connect multiple sheets from the same spreadsheet
- Preview sheets before connecting
- Activate/deactivate specific sheets
- Two-way sync with your Google Sheets

### 2. Low Stock Alerts
- Automatic detection of low stock items
- Email notifications with beautiful HTML templates
- Configurable thresholds per product
- Alert history and management

### 3. AI Assistant
- Context-aware responses based on your inventory
- Natural language queries
- Real-time analysis and insights
- Powered by Google Gemini 2.0 Flash

### 4. Export System
- Export to Excel with formatting
- Generate PDF reports
- Export alerts to CSV
- Batch export capabilities

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Your Name**
- GitHub: [@devnaam](https://github.com/devnaam)
- Email: workwithdevnaam@gmail.com

## 🙏 Acknowledgments

- Google Gemini API for AI capabilities
- Firebase for authentication
- MongoDB for database
- All open-source libraries used in this project

## 📞 Support

For support, email your.email@example.com or open an issue on GitHub.

---

Made  by Devnaam