const ChatHistory = require("../models/ChatHistory");
const Inventory = require("../models/Inventory");
const File = require("../models/File");
const axios = require("axios");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

// Helper function to get comprehensive inventory context
// Helper function to get comprehensive inventory context
const getInventoryContext = async (userId) => {
	try {
		// Get user's active sheets
		const user = await User.findOne({ firebaseUid: userId }).select(
			"activeSheets"
		);

		let inventoryDocs;

		if (user?.activeSheets && user.activeSheets.length > 0) {
			// Get data ONLY from active sheets
			const activeSourceIds = user.activeSheets.map((s) => s.sourceId);
			inventoryDocs = await Inventory.find({
				userId,
				sourceId: { $in: activeSourceIds },
			}).populate("fileId");
		} else {
			// Fallback: If no active sheets, use all inventory data
			inventoryDocs = await Inventory.find({ userId }).populate("fileId");
		}

		if (!inventoryDocs || inventoryDocs.length === 0) {
			return {
				hasData: false,
				message:
					"No inventory data found. Please upload a file or activate a connected sheet.",
			};
		}

		// ... rest of the function remains the same

		// Flatten all inventory items
		let allItems = [];
		inventoryDocs.forEach((inv) => {
			allItems = allItems.concat(inv.data || []);
		});

		if (allItems.length === 0) {
			return {
				hasData: false,
				message: "No items in inventory.",
			};
		}

		// Calculate comprehensive statistics
		const totalItems = allItems.reduce(
			(sum, item) => sum + (item.quantity || 0),
			0
		);
		const totalValue = allItems.reduce(
			(sum, item) => sum + (item.quantity || 0) * (item.price || 0),
			0
		);

		// Get unique categories
		const categories = [
			...new Set(allItems.map((item) => item.category).filter(Boolean)),
		];

		// Calculate per-category totals
		const categoryBreakdown = {};
		categories.forEach((cat) => {
			const catItems = allItems.filter((item) => item.category === cat);
			categoryBreakdown[cat] = {
				items: catItems.length,
				quantity: catItems.reduce((sum, item) => sum + (item.quantity || 0), 0),
				value: catItems.reduce(
					(sum, item) => sum + (item.quantity || 0) * (item.price || 0),
					0
				),
			};
		});

		// Stock status breakdown
		const inStock = allItems.filter(
			(item) => item.status === "in-stock"
		).length;
		const lowStock = allItems.filter(
			(item) => item.status === "low-stock"
		).length;
		const outOfStock = allItems.filter(
			(item) => item.status === "out-of-stock"
		).length;

		// Top 10 valuable products
		const topProducts = allItems
			.map((item) => ({
				name: item.productName,
				value: (item.quantity || 0) * (item.price || 0),
				quantity: item.quantity,
				price: item.price,
				category: item.category,
			}))
			.sort((a, b) => b.value - a.value)
			.slice(0, 10);

		// Low stock items
		const lowStockItems = allItems
			.filter(
				(item) => item.status === "low-stock" || item.status === "out-of-stock"
			)
			.map((item) => ({
				name: item.productName,
				quantity: item.quantity,
				status: item.status,
				category: item.category,
			}));

		return {
			hasData: true,
			summary: {
				totalProducts: allItems.length,
				totalItems: totalItems,
				totalValue: totalValue,
				categories: categories,
				categoryCount: categories.length,
			},
			categoryBreakdown: categoryBreakdown,
			stockStatus: {
				inStock: inStock,
				lowStock: lowStock,
				outOfStock: outOfStock,
			},
			topProducts: topProducts,
			lowStockItems: lowStockItems,
			allItems: allItems.slice(0, 100), // Send first 100 items for context
		};
	} catch (error) {
		console.error("Error getting inventory context:", error);
		return {
			hasData: false,
			message: "Error fetching inventory data.",
		};
	}
};

// @desc    Send message to AI
exports.sendMessage = async (req, res) => {
	try {
		const { message, sessionId } = req.body;

		if (!message) {
			return res.status(400).json({
				success: false,
				message: "Message is required",
			});
		}

		// Find or create chat session
		let chatSession = await ChatHistory.findOne({
			userId: req.user.uid,
			sessionId,
		});

		if (!chatSession) {
			chatSession = await ChatHistory.create({
				userId: req.user.uid,
				sessionId: sessionId || `session_${Date.now()}`,
				messages: [],
			});
		}

		// Add user message
		chatSession.messages.push({
			role: "user",
			content: message,
			timestamp: new Date(),
		});

		// Get FULL inventory context
		const inventoryContext = await getInventoryContext(req.user.uid);

		if (!inventoryContext.hasData) {
			const fallbackResponse =
				inventoryContext.message ||
				"I don't have any inventory data to analyze yet. Please upload a file first.";

			chatSession.messages.push({
				role: "assistant",
				content: fallbackResponse,
				timestamp: new Date(),
			});

			await chatSession.save();

			return res.status(200).json({
				success: true,
				response: fallbackResponse,
				sessionId: chatSession.sessionId,
			});
		}

		// Call AI service with RICH context
		try {
			const aiResponse = await axios.post(
				`${AI_SERVICE_URL}/api/ai/chat/message`,
				{
					message: message,
					session_id: chatSession.sessionId,
					user_id: req.user.uid,
					context: inventoryContext,
				},
				{
					timeout: 30000,
				}
			);

			const aiContent =
				aiResponse.data.response || "I couldn't generate a response.";

			// Add AI response
			chatSession.messages.push({
				role: "assistant",
				content: aiContent,
				timestamp: new Date(),
				metadata: {
					tokensUsed: aiResponse.data.tokens_used,
					model: "gemini-2.0-flash-exp",
				},
			});

			await chatSession.save();

			res.status(200).json({
				success: true,
				response: aiContent,
				sessionId: chatSession.sessionId,
			});
		} catch (aiError) {
			console.error("AI Service Error:", aiError.message);

			const fallbackResponse =
				"I'm having trouble processing your request. Please try again.";

			chatSession.messages.push({
				role: "assistant",
				content: fallbackResponse,
				timestamp: new Date(),
			});

			await chatSession.save();

			res.status(200).json({
				success: true,
				response: fallbackResponse,
				sessionId: chatSession.sessionId,
			});
		}
	} catch (error) {
		console.error("Send message error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to send message",
		});
	}
};

// @desc    Create new chat session
exports.createNewSession = async (req, res) => {
	try {
		const sessionId = `session_${Date.now()}`;

		const chatSession = await ChatHistory.create({
			userId: req.user.uid,
			sessionId,
			messages: [],
		});

		res.status(201).json({
			success: true,
			sessionId: chatSession.sessionId,
		});
	} catch (error) {
		console.error("Create session error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to create session",
		});
	}
};

// @desc    Get chat history
exports.getChatHistory = async (req, res) => {
	try {
		const { sessionId } = req.params;

		const chatSession = await ChatHistory.findOne({
			userId: req.user.uid,
			sessionId,
		});

		if (!chatSession) {
			return res.status(404).json({
				success: false,
				message: "Chat session not found",
			});
		}

		res.status(200).json({
			success: true,
			messages: chatSession.messages,
		});
	} catch (error) {
		console.error("Get history error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch chat history",
		});
	}
};

// @desc    Delete chat session
exports.deleteSession = async (req, res) => {
	try {
		const { sessionId } = req.params;

		await ChatHistory.deleteOne({
			userId: req.user.uid,
			sessionId,
		});

		res.status(200).json({
			success: true,
			message: "Chat session deleted successfully",
		});
	} catch (error) {
		console.error("Delete session error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to delete session",
		});
	}
};
