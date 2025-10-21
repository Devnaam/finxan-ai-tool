import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  TrendingUp, PieChart as PieChartIcon, BarChart3, Activity, 
  MessageSquare, Sparkles, Package, AlertTriangle, DollarSign, Clock
} from 'lucide-react';

const ChartsSection = ({ stats }) => {
  // State for all chart data
  const [chartData, setChartData] = useState({
    stockLevels: [],
    turnover: [],
    abcAnalysis: [],
    reorder: [],
    salesByCategory: [],
    slowMoving: [],
    inventoryValue: [],
    sellThrough: [],
    daysOfSupply: [],
    accuracy: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all analytics data
  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        stockLevels,
        turnover,
        abcAnalysis,
        reorder,
        salesByCategory,
        slowMoving,
        inventoryValue,
        sellThrough,
        daysOfSupply,
        accuracy,
      ] = await Promise.all([
        api.get('/analytics/stock-levels'),
        api.get('/analytics/turnover-rate'),
        api.get('/analytics/abc-analysis'),
        api.get('/analytics/reorder-report'),
        api.get('/analytics/sales-by-category'),
        api.get('/analytics/slow-moving-stock'),
        api.get('/analytics/inventory-value'),
        api.get('/analytics/sell-through-rate'),
        api.get('/analytics/days-of-supply'),
        api.get('/analytics/inventory-accuracy'),
      ]);

      setChartData({
        stockLevels: stockLevels.data || [],
        turnover: turnover.data || [],
        abcAnalysis: abcAnalysis.data || [],
        reorder: reorder.data || [],
        salesByCategory: salesByCategory.data || [],
        slowMoving: slowMoving.data || [],
        inventoryValue: inventoryValue.data || [],
        sellThrough: sellThrough.data || [],
        daysOfSupply: daysOfSupply.data || [],
        accuracy: accuracy.data || [],
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setError('Failed to load analytics data');
      toast.error('Failed to load charts');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = {
    primary: '#3B82F6',
    cyan: '#00F5FF',
    teal: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/10 dark:bg-gray-900/90 backdrop-blur-xl border border-cyber-cyan/30 rounded-xl p-4 shadow-glow-cyan">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm text-gray-700 dark:text-gray-300">
              <span style={{ color: entry.color }}>●</span> {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Chart Container Component
  const ChartCard = ({ title, icon: Icon, children, aiInsight, size = "normal" }) => (
    <div className={`relative group bg-white/10 dark:bg-gray-900/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-500 hover:border-cyber-cyan/50 hover:shadow-glow-cyan animate-fade-in-up ${size === "large" ? "lg:col-span-2" : ""}`}>
      <div className="absolute inset-0 bg-cyber-grid opacity-5 rounded-2xl" />
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyber-cyan/20 to-blue-500/20 group-hover:scale-110 transition-transform duration-300">
            <Icon className="h-5 w-5 text-cyber-cyan" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <div className="px-3 py-1 bg-gradient-to-r from-cyber-cyan/20 to-blue-500/20 border border-cyber-cyan/30 rounded-full backdrop-blur-sm">
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-cyber-cyan animate-pulse-slow" />
            <span className="text-xs font-medium text-cyber-cyan">AI</span>
          </div>
        </div>
      </div>
      <div className="relative z-10">{children}</div>
      {aiInsight && (
        <div className="relative mt-4 p-4 bg-gradient-to-r from-cyber-cyan/10 to-blue-500/10 border border-cyber-cyan/20 rounded-xl backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:translate-y-0 translate-y-2">
          <div className="absolute -top-2 left-8 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-cyber-cyan/20" />
          <div className="flex items-start gap-3">
            <MessageSquare className="h-5 w-5 text-cyber-cyan flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{aiInsight}</p>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyber-cyan mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics from your inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button onClick={fetchAllAnalytics} className="btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Current Stock Levels */}
        <ChartCard title="Current Stock Levels" icon={Package} aiInsight="📦 Real-time stock levels from your uploaded files and connected Google Sheets.">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.stockLevels}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="category" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="current" fill={COLORS.cyan} radius={[8, 8, 0, 0]} name="Current Stock" />
              <Bar dataKey="optimal" fill={COLORS.primary} radius={[8, 8, 0, 0]} name="Optimal Level" />
              <Bar dataKey="reorder" fill={COLORS.teal} radius={[8, 8, 0, 0]} name="Reorder Point" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 2: Inventory Turnover Rate */}
        <ChartCard title="Inventory Turnover Rate" icon={TrendingUp} aiInsight="📈 Calculated from your actual inventory movements over the last 6 months.">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData.turnover}>
              <defs>
                <linearGradient id="colorTurnover" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.cyan} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.cyan} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="turnover" fill="url(#colorTurnover)" stroke={COLORS.cyan} strokeWidth={3} name="Your Turnover" />
              <Line type="monotone" dataKey="industry" stroke={COLORS.teal} strokeWidth={2} strokeDasharray="5 5" name="Industry Avg" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 3: ABC Analysis (Pareto) */}
        <ChartCard title="ABC Analysis (Pareto)" icon={BarChart3} aiInsight="💎 Top products by value from your inventory. Focus on high-value items for maximum ROI.">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData.abcAnalysis}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="product" stroke="#9ca3af" style={{ fontSize: '10px' }} angle={-45} textAnchor="end" height={80} />
              <YAxis yAxisId="left" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar yAxisId="left" dataKey="value" fill={COLORS.primary} radius={[8, 8, 0, 0]} name="Value ($)" />
              <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke={COLORS.cyan} strokeWidth={3} name="Cumulative %" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 4: Low Stock / Reorder Report */}
        <ChartCard title="Low Stock / Reorder Alert" icon={AlertTriangle} aiInsight="⚠️ Items below optimal levels. Consider reordering these products soon.">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.reorder} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis type="number" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis type="category" dataKey="item" stroke="#9ca3af" style={{ fontSize: '10px' }} width={120} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="current" fill={COLORS.danger} radius={[0, 8, 8, 0]} name="Current Stock" />
              <Bar dataKey="reorder" fill={COLORS.teal} radius={[0, 8, 8, 0]} name="Reorder Point" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 5: Sales by Category */}
        <ChartCard title="Sales by Category" icon={PieChartIcon} aiInsight="📊 Distribution of inventory value across categories from your data.">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.salesByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.salesByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={[COLORS.cyan, COLORS.primary, COLORS.teal, COLORS.warning, '#8B5CF6'][index % 5]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 6: Slow-Moving & Dead Stock */}
        <ChartCard title="Slow-Moving & Dead Stock" icon={Clock} aiInsight="🐌 Items with very low quantities that may need clearance or removal.">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.slowMoving}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="category" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="deadStock" stackId="a" fill={COLORS.danger} radius={[0, 0, 0, 0]} name="Dead Stock" />
              <Bar dataKey="slowMoving" stackId="a" fill={COLORS.warning} radius={[8, 8, 0, 0]} name="Slow Moving" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 7: Inventory Value by Category */}
        <ChartCard title="Inventory Value by Category" icon={DollarSign} aiInsight="💰 Total monetary value of inventory broken down by category.">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.inventoryValue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="category" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill={COLORS.primary} radius={[8, 8, 0, 0]} name="Value ($)">
                {chartData.inventoryValue.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? COLORS.cyan : COLORS.primary} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 8: Sell-Through Rate */}
        <ChartCard title="Sell-Through Rate" icon={Activity} aiInsight="🎯 Percentage of inventory sold over time. Higher is better!">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData.sellThrough}>
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.teal} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.teal} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="rate" stroke={COLORS.teal} strokeWidth={3} fill="url(#colorRate)" name="Sell-Through Rate %" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 9: Days of Supply (DOS) */}
        <ChartCard title="Days of Supply (DOS)" icon={Package} aiInsight="📅 Estimated days until stockout based on current levels and usage patterns.">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.daysOfSupply}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="category" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="dos" fill={COLORS.cyan} radius={[8, 8, 0, 0]} name="Current DOS (days)" />
              <Bar dataKey="optimal" fill={COLORS.teal} radius={[8, 8, 0, 0]} name="Optimal DOS (days)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 10: Inventory Accuracy */}
        <ChartCard title="Inventory Accuracy Score" icon={TrendingUp} aiInsight="✅ Data quality metrics based on completeness of your inventory records.">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={chartData.accuracy}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="metric" stroke="#9ca3af" style={{ fontSize: '11px' }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
              <Radar name="Accuracy %" dataKey="score" stroke={COLORS.cyan} fill={COLORS.cyan} fillOpacity={0.3} strokeWidth={2} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>
    </div>
  );
};

export default ChartsSection;
