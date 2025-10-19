import {
  Package,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
} from 'lucide-react';

const StatsCards = ({ stats, lowStockItems }) => {
  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts?.toLocaleString() || '0',
      change: '+12.5%',
      trend: 'up',
      icon: Package,
      bgColor: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Total Value',
      value: `$${parseFloat(stats.totalValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: '+8.2%',
      trend: 'up',
      icon: DollarSign,
      bgColor: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockCount || 0,
      change: lowStockItems.length > 0 ? 'Needs attention' : 'All good',
      trend: lowStockItems.length > 0 ? 'down' : 'up',
      icon: AlertTriangle,
      bgColor: 'from-yellow-500 to-yellow-600',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      title: 'Categories',
      value: stats.categoriesCount || 0,
      change: '+15.3%',
      trend: 'up',
      icon: Layers,
      bgColor: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {statCards.map((stat, index) => (
        <div 
          key={index} 
          className="card hover:shadow-xl transition-all duration-300 group cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.title}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stat.value}
              </p>
              <div className="flex items-center gap-1 mt-3">
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
            <div className={`${stat.iconBg} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
              <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
