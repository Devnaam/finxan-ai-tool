const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
			ref: "User",
		},

		// spreadsheet id added here

		spreadsheetId: {
			type: String,
			default: null,
		},

		fileId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "File",
		},
		sourceType: {
			type: String,
			enum: ["google-sheet", "excel", "pdf", "csv", "manual"],
			required: true,
		},
		sourceId: {
			type: String,
		},
		data: [
			{
				productName: String,
				sku: String,
				category: String,
				quantity: Number,
				price: Number,
				supplier: String,
				lastRestocked: Date,
				location: String,
				status: {
					type: String,
					enum: ["in-stock", "low-stock", "out-of-stock"],
					default: "in-stock",
				},
				customFields: mongoose.Schema.Types.Mixed,
			},
		],
		lastSynced: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
	}
);

// Index for faster queries
inventorySchema.index({ userId: 1, sourceType: 1 });
inventorySchema.index({ "data.sku": 1 });

module.exports = mongoose.model("Inventory", inventorySchema);
