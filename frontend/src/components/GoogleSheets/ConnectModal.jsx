import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";

const ConnectModal = ({ onClose, onSuccess }) => {
  const [spreadsheetUrl, setSpreadsheetUrl] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [availableSheets, setAvailableSheets] = useState(null);
  const [selectedSheets, setSelectedSheets] = useState([]);
  const [connecting, setConnecting] = useState(false);

  const extractSpreadsheetId = (url) => {
    const patterns = [
      /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
      /^([a-zA-Z0-9-_]+)$/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handlePreview = async () => {
    if (!spreadsheetUrl.trim()) {
      toast.error("Please enter a spreadsheet URL or ID");
      return;
    }

    const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
    if (!spreadsheetId) {
      toast.error("Invalid spreadsheet URL or ID");
      return;
    }

    setPreviewing(true);
    try {
      const response = await api.post("/sheets/preview", { spreadsheetId });
      setAvailableSheets(response);
      setSelectedSheets([]);
      toast.success(`Found ${response.sheets.length} sheets`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to preview sheets");
      setAvailableSheets(null);
    } finally {
      setPreviewing(false);
    }
  };

  const handleConnect = async () => {
    if (selectedSheets.length === 0) {
      toast.error("Please select at least one sheet");
      return;
    }

    setConnecting(true);
    try {
      const promises = selectedSheets.map((sheetName) =>
        api.post("/sheets/connect-specific", {
          spreadsheetId: availableSheets.spreadsheetId,
          sheetName: sheetName,
          spreadsheetTitle: availableSheets.spreadsheetTitle,
        })
      );
      await Promise.all(promises);
      toast.success(`Connected ${selectedSheets.length} sheet(s) successfully!`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to connect some sheets");
    } finally {
      setConnecting(false);
    }
  };

  const toggleSheet = (sheetName) => {
    setSelectedSheets((prev) =>
      prev.includes(sheetName)
        ? prev.filter((name) => name !== sheetName)
        : [...prev, sheetName]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Connect Google Sheets
        </h3>

        <div className="space-y-4">
          {!availableSheets ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Spreadsheet URL or ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={spreadsheetUrl}
                  onChange={(e) => setSpreadsheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="input-field flex-1"
                />
                <button
                  onClick={handlePreview}
                  disabled={previewing}
                  className="btn-primary whitespace-nowrap"
                >
                  {previewing ? "Loading..." : "Preview Sheets"}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                ⚠️ Make sure the sheet is publicly shared (Anyone with the link)
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {availableSheets.spreadsheetTitle}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Select sheets to connect ({selectedSheets.length} selected)
                  </p>
                </div>
                <button
                  onClick={() => {
                    setAvailableSheets(null);
                    setSelectedSheets([]);
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  ← Back
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableSheets.sheets.map((sheet) => (
                  <div
                    key={sheet.sheetId}
                    onClick={() => sheet.hasData && toggleSheet(sheet.sheetName)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedSheets.includes(sheet.sheetName)
                        ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    } ${!sheet.hasData ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedSheets.includes(sheet.sheetName)}
                        onChange={() => {}}
                        disabled={!sheet.hasData}
                        className="rounded"
                      />
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        {sheet.sheetName}
                      </h5>
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
                      <span>{sheet.rowCount} rows</span>
                      <span>{sheet.columnCount} columns</span>
                      {sheet.hasData ? (
                        <span className="text-green-600">✓ Has data</span>
                      ) : (
                        <span className="text-red-600">✗ No data</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={onClose} className="btn-secondary flex-1" disabled={connecting}>
              Cancel
            </button>
            {availableSheets && (
              <button
                onClick={handleConnect}
                disabled={connecting || selectedSheets.length === 0}
                className="btn-primary flex-1"
              >
                {connecting ? "Connecting..." : `Connect ${selectedSheets.length} Sheet(s)`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectModal;
