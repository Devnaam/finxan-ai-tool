import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/Layout/DashboardLayout";
import api from "../services/api";
import toast from "react-hot-toast";
import { 
  FileSpreadsheet, 
  Download, 
  RefreshCw, 
  FileUp, 
  FileText 
} from 'lucide-react';

// Import dashboard components
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import StatsCards from "../components/Dashboard/StatsCards";
import ChartsSection from "../components/Dashboard/ChartsSection";
import RecentFiles from "../components/Dashboard/RecentFiles";
import QuickActions from "../components/Dashboard/QuickActions";
import ActiveSheetsCard from "../components/Dashboard/ActiveSheetsCard";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalProducts: 0,
    activeSheets: 0,
    categoriesCount: 0,
    filesCount: 0,
  });
  const [files, setFiles] = useState([]);
  const [activeSheets, setActiveSheets] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportMenu && !event.target.closest('.export-dropdown')) {
        setShowExportMenu(false);
      }
    };
    
    if (showExportMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showExportMenu]);

  const fetchDashboardData = async () => {
    try {
      const [
        statsResponse,
        filesResponse,
        activeSheetsResponse,
        inventoryResponse,
      ] = await Promise.all([
        api.get("/inventory/stats"),
        api.get("/files"),
        api.get("/sheets/active"),
        api.get("/inventory/low-stock"),
      ]);

      setStats({
        ...statsResponse.stats,
        activeSheets: activeSheetsResponse.activeSheets?.length || 0,
        filesCount: filesResponse.files?.length || 0,
      });
      setFiles(filesResponse.files || []);
      setActiveSheets(activeSheetsResponse.activeSheets || []);
      setLowStockItems(inventoryResponse.items || []);
    } catch (error) {
      toast.error("Failed to load dashboard data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchDashboardData();
  };

  const handleUploadFile = () => {
    navigate("/files");
  };

  const handleViewInventory = () => {
    navigate("/inventory");
  };

  const handleOpenAI = () => {
    navigate("/chat");
  };

  const handleViewAllFiles = () => {
    navigate("/files");
  };

  const handleExportExcel = async () => {
    setShowExportMenu(false);
    try {
      const response = await api.get('/export/excel', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventory-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Inventory exported to Excel!');
    } catch (error) {
      toast.error('Failed to export to Excel');
      console.error(error);
    }
  };

  const handleExportPDF = async () => {
    setShowExportMenu(false);
    try {
      const response = await api.get('/export/pdf', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventory-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Inventory exported to PDF!');
    } catch (error) {
      toast.error('Failed to export to PDF');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Enhanced Header with Export */}
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
            
            {/* Export Dropdown */}
            <div className="relative export-dropdown">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowExportMenu(!showExportMenu);
                }}
                className="btn-secondary flex items-center gap-2"
              >
                <Download className="h-5 w-5" />
                <span className="hidden sm:inline">Export</span>
              </button>
              
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                  <button
                    onClick={handleExportExcel}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 rounded-t-lg transition-colors"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Export to Excel
                    </span>
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 rounded-b-lg transition-colors"
                  >
                    <FileText className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Export to PDF
                    </span>
                  </button>
                </div>
              )}
            </div>
            
            <button 
              onClick={handleUploadFile}
              className="btn-primary flex items-center gap-2"
            >
              <FileUp className="h-5 w-5" />
              <span className="hidden sm:inline">Upload File</span>
            </button>
          </div>
        </div>

        <ActiveSheetsCard
          activeSheets={activeSheets}
          activeCount={stats.activeSheets}
        />

        <StatsCards stats={stats} lowStockItems={lowStockItems} />

        <ChartsSection stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentFiles files={files} onViewAll={handleViewAllFiles} />
          </div>
          <div className="lg:col-span-1">
            <QuickActions
              onUploadFile={handleUploadFile}
              onViewInventory={handleViewInventory}
              onOpenAI={handleOpenAI}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
