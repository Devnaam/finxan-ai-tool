import { useState, useEffect } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import {
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  Calendar,
  Download,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getInventoryStats } from '../services/inventoryService';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await getInventoryStats();
      setStats(response.stats || stats);
    } catch (error) {
      toast.error('Failed to load analytics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Sample data for charts
  const inventoryTrendData = [
    { date: 'Week 1', value: 4000, items: 120 },
    { date: 'Week 2', value: 3000, items: 98 },
    { date: 'Week 3', value: 5000, items: 145 },
    { date: 'Week 4', value: 4500, items: 130 },
  ];

  const categoryData = [
    { name: 'Electronics', value: 400, color: '#0EA5E9' },
    { name: 'Clothing', value: 300, color: '#8B5CF6' },
    { name: 'Food', value: 200, color: '#10B981' },
    { name: 'Books', value: 150, color: '#F59E0B' },
    { name: 'Others', value: 100, color: '#EF4444' },
  ];

  const topSellingData = [
    { product: 'Product A', sales: 850, revenue: 42500 },
    { product: 'Product B', sales: 720, revenue: 36000 },
    { product: 'Product C', sales: 680, revenue: 34000 },
    { product: 'Product D', sales: 550, revenue: 27500 },
    { product: 'Product E', sales: 480, revenue: 24000 },
  ];

  const stockStatusData = [
    { name: 'In Stock', value: stats.totalProducts - stats.lowStockCount, color: '#10B981' },
    { name: 'Low Stock', value: stats.lowStockCount, color: '#F59E0B' },
    { name: 'Out of Stock', value: stats.outOfStockCount, color: '#EF4444' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Analytics & Insights
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your inventory performance and trends
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="input-field"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button className="btn-primary flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  ${parseFloat(stats.totalValue).toLocaleString()}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  +12.5% from last month
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Items</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalItems.toLocaleString()}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                  {stats.totalProducts} products
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.lowStockCount}
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                  Needs attention
                </p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  +8.2%
                </p>
                <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">
                  Trending up
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inventory Value Trend */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Inventory Value Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={inventoryTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#0EA5E9"
                  strokeWidth={2}
                  dot={{ fill: '#0EA5E9', r: 4 }}
                  name="Value ($)"
                />
                <Line
                  type="monotone"
                  dataKey="items"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={{ fill: '#8B5CF6', r: 4 }}
                  name="Items"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Stock Status Distribution */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Stock Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stockStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stockStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Category Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Selling Products */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Top Selling Products
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSellingData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9CA3AF" />
                <YAxis dataKey="product" type="category" stroke="#9CA3AF" width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="sales" fill="#0EA5E9" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI-Powered Insights
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                📈 Inventory is growing at 8.2% monthly
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">
                Above industry average of 5.3%
              </p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-300">
                ⚠️ 12 products need restocking soon
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-2">
                Projected to run out in 7-14 days
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <p className="text-sm font-medium text-green-900 dark:text-green-300">
                💰 Electronics category has highest margin
              </p>
              <p className="text-xs text-green-700 dark:text-green-400 mt-2">
                Consider increasing stock by 15%
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
