const User = require("../models/User");
const admin = require("firebase-admin");

// @desc    Update user profile
exports.updateProfile = async (req, res) => {
	try {
		const { name } = req.body;
		const userId = req.user.uid;

		if (!name || !name.trim()) {
			return res.status(400).json({
				success: false,
				message: "Name is required",
			});
		}

		// Update in MongoDB
		const user = await User.findOneAndUpdate(
			{ firebaseUid: userId },
			{ name: name.trim() },
			{ new: true }
		);

		// Update in Firebase Auth
		try {
			await admin.auth().updateUser(userId, {
				displayName: name.trim(),
			});
		} catch (firebaseError) {
			console.log(
				"Firebase update failed (non-critical):",
				firebaseError.message
			);
		}

		res.status(200).json({
			success: true,
			message: "Profile updated successfully",
			user: {
				name: user.name,
				email: user.email,
				plan: user.plan,
			},
		});
	} catch (error) {
		console.error("Update profile error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to update profile",
		});
	}
};

// @desc    Update notification preferences
exports.updateNotifications = async (req, res) => {
	try {
		const { lowStock, newFiles, weeklyReport } = req.body;
		const userId = req.user.uid;

		const user = await User.findOneAndUpdate(
			{ firebaseUid: userId },
			{
				$set: {
					"notificationPreferences.lowStock":
						lowStock !== undefined ? lowStock : true,
					"notificationPreferences.newFiles":
						newFiles !== undefined ? newFiles : true,
					"notificationPreferences.weeklyReport":
						weeklyReport !== undefined ? weeklyReport : false,
				},
			},
			{ new: true, upsert: false }
		);

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		res.status(200).json({
			success: true,
			message: "Notification preferences updated",
			preferences: user.notificationPreferences || {
				lowStock: lowStock !== undefined ? lowStock : true,
				newFiles: newFiles !== undefined ? newFiles : true,
				weeklyReport: weeklyReport !== undefined ? weeklyReport : false,
			},
		});
	} catch (error) {
		console.error("Update notifications error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to update notification preferences",
		});
	}
};

// @desc    Get notification preferences
exports.getNotifications = async (req, res) => {
	try {
		const userId = req.user.uid;

		const user = await User.findOne({ firebaseUid: userId }).select(
			"notificationPreferences"
		);

		res.status(200).json({
			success: true,
			preferences: user?.notificationPreferences || {
				lowStock: true,
				newFiles: true,
				weeklyReport: false,
			},
		});
	} catch (error) {
		console.error("Get notifications error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch notification preferences",
		});
	}
};

// @desc    Change password
exports.changePassword = async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body;
		const userId = req.user.uid;

		if (!currentPassword || !newPassword) {
			return res.status(400).json({
				success: false,
				message: "Current and new password are required",
			});
		}

		if (newPassword.length < 6) {
			return res.status(400).json({
				success: false,
				message: "New password must be at least 6 characters",
			});
		}

		if (currentPassword === newPassword) {
			return res.status(400).json({
				success: false,
				message: "New password must be different from current password",
			});
		}

		// Get user email for re-authentication
		const user = await User.findOne({ firebaseUid: userId });
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Note: For password change, Firebase requires recent authentication
		// In a production app, you should verify the current password first
		// For now, we'll just update the password

		try {
			await admin.auth().updateUser(userId, {
				password: newPassword,
			});

			res.status(200).json({
				success: true,
				message: "Password updated successfully",
			});
		} catch (firebaseError) {
			console.error("Firebase password update error:", firebaseError);
			res.status(500).json({
				success: false,
				message:
					firebaseError.message || "Failed to update password in Firebase",
			});
		}
	} catch (error) {
		console.error("Change password error:", error);
		res.status(500).json({
			success: false,
			message: error.message || "Failed to update password",
		});
	}
};

// @desc    Upload profile photo
// @desc    Upload/save profile photo URL for user
exports.uploadPhoto = async (req, res) => {
	try {
		const userId = req.user.uid;
		const { photoURL } = req.body;
		if (!photoURL) {
			return res
				.status(400)
				.json({ success: false, message: "No photo URL provided" });
		}

		// Update in MongoDB
		const user = await User.findOneAndUpdate(
			{ firebaseUid: userId },
			{ profilePicture: photoURL },
			{ new: true }
		);
		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: "User not found" });
		}

		// Also update in Firebase Auth (will be a valid external URL now)
		// Optionally: wrap in try/catch as before
		const admin = require("firebase-admin");
		try {
			await admin.auth().updateUser(userId, { photoURL });
		} catch (firebaseError) {
			console.log(
				"Firebase photo update failed (non-critical):",
				firebaseError.message
			);
		}

		res.status(200).json({
			success: true,
			message: "Profile photo updated",
			photoURL,
		});
	} catch (error) {
		console.error("Upload photo error:", error);
		res.status(500).json({ success: false, message: "Failed to upload photo" });
	}
};
