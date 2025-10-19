import { useState, useEffect } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import {
  Package,
  Search,
  Filter,
  Download,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Info,
  Sheet,
  FileText,
} from "lucide-react";
import api from "../services/api";
import { getInventory, getLowStockItems } from "../services/inventoryService";
import toast from "react-hot-toast";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [activeSheets, setActiveSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchInventory();
    fetchLowStockItems();
    fetchActiveSheets();
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [currentPage, filterStatus, searchQuery]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
      };

      if (searchQuery) params.search = searchQuery;
      if (filterStatus !== "all") params.status = filterStatus;

      const response = await getInventory(params);
      setInventory(response.inventory || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      toast.error("Failed to load inventory");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStockItems = async () => {
    try {
      const response = await getLowStockItems();
      setLowStockItems(response.items || []);
    } catch (error) {
      console.error("Failed to fetch low stock items:", error);
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

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const response = await api.get("/export/excel", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `inventory-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Inventory exported to Excel!");
    } catch (error) {
      toast.error("Failed to export to Excel");
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const response = await api.get("/export/pdf", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `inventory-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Inventory exported to PDF!");
    } catch (error) {
      toast.error("Failed to export to PDF");
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      "in-stock":
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      "low-stock":
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      "out-of-stock":
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {status.replace("-", " ")}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Inventory Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track and manage your inventory items
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExportExcel}
              disabled={exporting || inventory.length === 0}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export to Excel"
            >
              <Download className="h-5 w-5" />
              <span className="hidden sm:inline">Excel</span>
            </button>
            <button
              onClick={handleExportPDF}
              disabled={exporting || inventory.length === 0}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export to PDF"
            >
              <FileText className="h-5 w-5" />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>

        {/* Active Sheets Banner */}
        {activeSheets && activeSheets.length > 0 ? (
          <div className="card bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-green-900 dark:text-green-300">
                  Showing data from {activeSheets.length} active sheet(s)
                </div>
                <div className="text-xs text-green-700 dark:text-green-400 mt-1">
                  {activeSheets.map((s) => s.sheetName).join(", ")}
                </div>
              </div>
              <Sheet className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        ) : (
          <div className="card bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                  No Google Sheets activated
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                  Data shown is from uploaded files only. Activate sheets in
                  Google Sheets page.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div className="card bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-300">
                  Low Stock Alert
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-400 mt-1">
                  You have {lowStockItems.length} items that are low in stock or
                  out of stock
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {lowStockItems.slice(0, 3).map((item, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded-md"
                    >
                      {item.productName} ({item.quantity})
                    </span>
                  ))}
                  {lowStockItems.length > 3 && (
                    <span className="text-xs text-yellow-600 dark:text-yellow-400">
                      +{lowStockItems.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product name, SKU, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 min-w-[200px]">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field"
              >
                <option value="all">All Status</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="card">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Loading inventory...
              </p>
            </div>
          ) : inventory.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No inventory items found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery || filterStatus !== "all"
                  ? "Try adjusting your filters or search query"
                  : "Upload a file or activate a Google Sheet to see inventory items"}
              </p>
              {(searchQuery || filterStatus !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterStatus("all");
                  }}
                  className="btn-secondary"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                        Product
                      </th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                        SKU
                      </th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                        Category
                      </th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                        Quantity
                      </th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                        Price
                      </th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                        Value
                      </th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                        Status
                      </th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                        Source
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item, index) => {
                      const totalValue =
                        (item.quantity || 0) * (item.price || 0);

                      return (
                        <tr
                          key={index}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                                <Package className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {item.productName || "Unnamed Product"}
                                </p>
                                {item.supplier && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {item.supplier}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                              {item.sku || "N/A"}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {item.category || "Uncategorized"}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              {item.quantity > 50 ? (
                                <TrendingUp className="h-4 w-4 text-green-500" />
                              ) : item.quantity > 0 ? (
                                <TrendingDown className="h-4 w-4 text-yellow-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {item.quantity || 0}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              ${parseFloat(item.price || 0).toFixed(2)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                              ${totalValue.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {getStatusBadge(item.status || "in-stock")}
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                              {item.source === "google-sheet"
                                ? "Google Sheet"
                                : "Uploaded File"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing page{" "}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {currentPage}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {totalPages}
                    </span>
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Inventory;
