const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const dashboardRoutes = require('./routes/dashboardRoutes');
const alertRoutes = require('./routes/alertRoutes');
const exportRoutes = require('./routes/exportRoutes');

// Load environment variables
dotenv.config();

const { initializeFirebase } = require("./config/firebase");
initializeFirebase();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
// Middleware
// Middleware
const allowedOrigins = [
	"http://localhost:3000",
	"http://localhost:5173",
	"http://localhost:5174",
];

app.use(
	cors({
		origin: function (origin, callback) {
			// Allow requests with no origin (like mobile apps or curl)
			if (!origin) return callback(null, true);

			if (process.env.NODE_ENV === "production") {
				// In production, only allow your deployed frontend
				if (origin.includes("vercel.app")) {
					return callback(null, true);
				}
			} else {
				// In development, allow all localhost origins
				if (allowedOrigins.includes(origin)) {
					return callback(null, true);
				}
			}

			callback(new Error("Not allowed by CORS"));
		},
		credentials: true,
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploads
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/files", require("./routes/fileRoutes"));
app.use("/api/sheets", require("./routes/sheetRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use('/api/export', exportRoutes);



app.use('/api/alerts', alertRoutes);

// Health check route
app.get("/health", (req, res) => {
	res.status(200).json({
		status: "OK",
		message: "Finxan AI Backend is running",
		timestamp: new Date().toISOString(),
	});
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(err.status || 500).json({
		success: false,
		message: err.message || "Internal Server Error",
		...(process.env.NODE_ENV === "development" && { stack: err.stack }),
	});
});

// 404 handler
app.use("*", (req, res) => {
	res.status(404).json({
		success: false,
		message: "Route not found",
	});
});

app.use('/api/dashboard', dashboardRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(
		`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
	);
});
