import { FileUp, RefreshCw } from 'lucide-react';

const DashboardHeader = ({ onUploadFile }) => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome back! Here's what's happening with your inventory.
        </p>
      </div>
      
      <div className="flex gap-3">
        <button 
          onClick={handleRefresh}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className="h-5 w-5" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
        <button 
          onClick={onUploadFile}
          className="btn-primary flex items-center gap-2"
        >
          <FileUp className="h-5 w-5" />
          <span className="hidden sm:inline">Upload File</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
