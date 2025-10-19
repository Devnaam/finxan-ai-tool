import {
  FileSpreadsheet,
  Table,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Trash2,
  ChevronRight,
} from "lucide-react";

const SheetsList = ({
  sheets,
  activeSheets,
  onToggleActive,
  onSync,
  onDisconnect,
  onConnect,
}) => {
  const isActive = (sheet) => {
    return activeSheets.some(
      (s) => s.spreadsheetId === sheet.sheetId && s.sheetName === sheet.sheetName
    );
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Connected Sheets ({sheets.length})
        </h2>
        {activeSheets.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-gray-600 dark:text-gray-400">
              {activeSheets.length} active sheet(s)
            </span>
          </div>
        )}
      </div>

      {sheets.length === 0 ? (
        <div className="text-center py-12">
          <FileSpreadsheet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No sheets connected yet
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2 mb-4">
            Connect your Google Sheets to start syncing inventory data
          </p>
          <button onClick={onConnect} className="btn-primary">
            Connect Your First Sheet
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sheets.map((sheet, index) => {
            const active = isActive(sheet);

            return (
              <div
                key={`${sheet.sheetId}_${sheet.sheetName}_${index}`}
                className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                  active
                    ? "bg-green-50 dark:bg-green-900/20 border-2 border-green-500"
                    : "bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`p-3 rounded-lg ${
                      active
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-gray-200 dark:bg-gray-600"
                    }`}
                  >
                    <Table
                      className={`h-6 w-6 ${
                        active
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {active && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {sheet.spreadsheetTitle || "Untitled Spreadsheet"}
                      </h4>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {sheet.sheetName}
                      </span>
                      {active && (
                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded font-medium">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Last synced: {new Date(sheet.lastSynced).toLocaleString()}
                      </p>
                      {sheet.rowCount && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                          {sheet.rowCount} rows
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleActive(sheet)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      active
                        ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                    }`}
                    title={active ? "Deactivate" : "Activate for analysis"}
                  >
                    {active ? "Deactivate" : "Activate"}
                  </button>
                  <a
                    href={`https://docs.google.com/spreadsheets/d/${sheet.sheetId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Open in Google Sheets"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                  <button
                    onClick={() => onSync(sheet)}
                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                    title="Sync Now"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDisconnect(sheet)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Disconnect"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SheetsList;
