import { Plus } from "lucide-react";

const SheetsHeader = ({ onConnect }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Google Sheets Integration
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Connect and manage multiple sheets from your spreadsheets
        </p>
      </div>
      <button onClick={onConnect} className="btn-primary flex items-center gap-2">
        <Plus className="h-5 w-5" />
        Connect Sheets
      </button>
    </div>
  );
};

export default SheetsHeader;
