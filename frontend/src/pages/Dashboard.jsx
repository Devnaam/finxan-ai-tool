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
  FileText,
  Sparkles,
} from 'lucide-react';

// Import enhanced dashboard components
import AISearchBar from "../components/Dashboard/AISearchBar";
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
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [statsRes, filesRes, sheetsRes, lowStockRes] = await Promise.all([
        api.get("/inventory/stats"),
        api.get("/files"),
        api.get("/sheets/active"),
        api.get("/inventory/low-stock"),
      ]);

      setStats(statsRes.stats || {});
      setFiles(filesRes.files || []);
      setActiveSheets(sheetsRes.sheets || []);
      setLowStockItems(lowStockRes.items || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      setExporting(true);
      const response = await api.get(`/export/${format}`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventory-${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Export failed');
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  const handleAISearch = (query) => {
    console.log("AI Search:", query);
    // Navigate to chat or process query
    navigate(`/chat?query=${encodeURIComponent(query)}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyber-cyan"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 animate-pulse">
              Loading your AI-powered dashboard...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Futuristic Background with animated gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
        <div className="absolute inset-0 bg-cyber-grid opacity-[0.02]" />
        
        {/* Animated Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyber-cyan/20 rounded-full filter blur-3xl animate-float opacity-20" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyber-purple/20 rounded-full filter blur-3xl animate-float-slow opacity-20" />
      </div>

      <div className="space-y-8 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-cyber-cyan to-cyber-purple rounded-xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                AI Inventory Dashboard
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back! Here's what's happening with your inventory.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => fetchDashboardData()}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={() => handleExport('excel')}
              disabled={exporting}
              className="btn-secondary flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export Excel
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={exporting}
              className="btn-secondary flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Export PDF
            </button>
          </div>
        </div>

        {/* AI Search Bar - Hero Element */}
        <AISearchBar onSearch={handleAISearch} />

        {/* Active Sheets Banner */}
        {activeSheets.length > 0 && (
          <ActiveSheetsCard
            activeSheets={activeSheets}
            activeCount={stats.activeSheets}
          />
        )}

        {/* Stats Cards */}
        <StatsCards stats={stats} lowStockItems={lowStockItems} />

        {/* Charts Section */}
        <ChartsSection stats={stats} />

        {/* Bottom Section: Recent Files + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Files - Takes 2 columns */}
          <div className="lg:col-span-2">
            <RecentFiles
              files={files.slice(0, 5)}
              onViewAll={() => navigate('/files')}
            />
          </div>

          {/* Quick Actions - Takes 1 column */}
          <div>
            <QuickActions
              onUploadFile={() => navigate('/files')}
              onViewInventory={() => navigate('/inventory')}
              onOpenAI={() => navigate('/chat')}
            />
          </div>
        </div>

        {/* Footer AI Badge */}
        <div className="flex items-center justify-center py-8">
          <div className="
            px-6 py-3
            bg-gradient-to-r from-cyber-cyan/10 to-cyber-purple/10
            border border-cyber-cyan/20
            rounded-full
            backdrop-blur-sm
            animate-pulse-slow
          ">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyber-cyan" />
              <span className="text-sm font-medium bg-gradient-to-r from-cyber-cyan to-cyber-purple bg-clip-text text-transparent">
                Powered by Advanced AI • Real-time Insights • Natural Language Processing
              </span>
              <Sparkles className="h-4 w-4 text-cyber-purple" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
