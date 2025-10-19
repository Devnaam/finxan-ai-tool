import { useState, useEffect } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

import SheetsHeader from "../components/GoogleSheets/SheetsHeader";
import InfoBanner from "../components/GoogleSheets/InfoBanner";
import SheetsList from "../components/GoogleSheets/SheetsList";
import ConnectModal from "../components/GoogleSheets/ConnectModal";

const GoogleSheets = () => {
	const [sheets, setSheets] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showConnectModal, setShowConnectModal] = useState(false);
	const [activeSheets, setActiveSheets] = useState([]); // Multiple active sheets

	useEffect(() => {
		fetchSheets();
		fetchActiveSheets();
	}, []);

	const fetchSheets = async () => {
		try {
			const response = await api.get("/sheets");
			setSheets(response.sheets || []);
		} catch (error) {
			console.error("Failed to fetch sheets:", error);
		} finally {
			setLoading(false);
		}
	};

	const fetchActiveSheets = async () => {
		try {
			const response = await api.get("/sheets/active");
			setActiveSheets(response.activeSheets || []);
		} catch (error) {
			console.error("Failed to fetch active sheets:", error);
		}
	};

	const handleToggleActive = async (sheet) => {
		try {
			const isActive = activeSheets.some(
				(s) =>
					s.spreadsheetId === sheet.sheetId && s.sheetName === sheet.sheetName
			);

			if (isActive) {
				// Deactivate
				await api.post("/sheets/deactivate", {
					spreadsheetId: sheet.sheetId,
					sheetName: sheet.sheetName,
				});
				setActiveSheets((prev) =>
					prev.filter(
						(s) =>
							!(
								s.spreadsheetId === sheet.sheetId &&
								s.sheetName === sheet.sheetName
							)
					)
				);
				toast.success(`"${sheet.sheetName}" deactivated`);
			} else {
				// Activate
				await api.post("/sheets/set-active", {
					spreadsheetId: sheet.sheetId,
					sheetName: sheet.sheetName,
				});
				setActiveSheets((prev) => [
					...prev,
					{ spreadsheetId: sheet.sheetId, sheetName: sheet.sheetName },
				]);
				toast.success(`"${sheet.sheetName}" activated for analysis`);
			}
		} catch (error) {
			toast.error("Failed to toggle sheet activation");
		}
	};

	const handleSync = async (sheet) => {
		try {
			await api.post("/sheets/sync", {
				spreadsheetId: sheet.sheetId,
				sheetName: sheet.sheetName,
			});
			toast.success("Sheet synced successfully!");
			fetchSheets();
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to sync sheet");
			console.error(error);
		}
	};

	const handleDisconnect = async (sheet) => {
		if (!confirm(`Disconnect "${sheet.sheetName}"?`)) return;

		try {
			await api.post("/sheets/disconnect", {
				spreadsheetId: sheet.sheetId,
				sheetName: sheet.sheetName,
			});

			// Remove from active sheets if it was active
			setActiveSheets((prev) =>
				prev.filter(
					(s) =>
						!(
							s.spreadsheetId === sheet.sheetId &&
							s.sheetName === sheet.sheetName
						)
				)
			);

			toast.success("Sheet disconnected");
			fetchSheets();
		} catch (error) {
			toast.error("Failed to disconnect sheet");
			console.error(error);
		}
	};

	if (loading) {
		return (
			<DashboardLayout>
				<div className="flex items-center justify-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className="space-y-6">
				<SheetsHeader onConnect={() => setShowConnectModal(true)} />
				<InfoBanner />
				<SheetsList
					sheets={sheets}
					activeSheets={activeSheets}
					onToggleActive={handleToggleActive}
					onSync={handleSync}
					onDisconnect={handleDisconnect}
					onConnect={() => setShowConnectModal(true)}
				/>
			</div>

			{showConnectModal && (
				<ConnectModal
					onClose={() => setShowConnectModal(false)}
					onSuccess={fetchSheets}
				/>
			)}
		</DashboardLayout>
	);
};

export default GoogleSheets;
