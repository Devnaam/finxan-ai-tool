const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        firebaseUid: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        name: {
            type: String,
            required: true,
        },
        profilePicture: {
            type: String,
            default: null,
        },
        plan: {
            type: String,
            enum: ["free", "pro", "enterprise"],
            default: "free",
        },
        connectedSheets: [
            {
                sheetId: String,
                sheetName: String,
                spreadsheetTitle: String,
                lastSynced: Date,
                rowCount: Number,
            },
        ],
        // UPDATED: Support multiple active sheets
        activeSheets: [
            {
                spreadsheetId: String,
                sheetName: String,
                sourceId: String, // "spreadsheetId_sheetName"
            },
        ],
        googleTokens: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        googleConnected: {
            type: Boolean,
            default: false,
        },
        uploadedFiles: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "File",
            },
        ],
        createdAt: {
            type: Date,
            default: Date.now,
        },
        lastLogin: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);
