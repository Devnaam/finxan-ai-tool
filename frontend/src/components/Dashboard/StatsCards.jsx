import { Package, DollarSign, AlertTriangle, TrendingUp, ArrowUpRight, ArrowDownRight, Layers, Sparkles } from 'lucide-react';

const StatsCards = ({ stats, lowStockItems }) => {
  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts?.toLocaleString() || '0',
      change: '+12.5%',
      trend: 'up',
      icon: Package,
      gradient: 'from-blue-500 via-blue-600 to-cyan-500',
      glowColor: 'shadow-glow-cyan',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      bgPattern: 'bg-cyber-grid',
    },
    {
      title: 'Total Value',
      value: `$${parseFloat(stats.totalValue || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      change: '+8.2%',
      trend: 'up',
      icon: DollarSign,
      gradient: 'from-green-500 via-emerald-600 to-teal-500',
      glowColor: 'shadow-glow-green',
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-400',
      bgPattern: 'bg-cyber-grid',
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockCount || 0,
      change: lowStockItems.length > 0 ? 'Needs attention' : 'All good',
      trend: lowStockItems.length > 0 ? 'down' : 'up',
      icon: AlertTriangle,
      gradient: 'from-yellow-500 via-amber-600 to-orange-500',
      glowColor: lowStockItems.length > 0 ? 'shadow-glow-lg' : '',
      iconBg: 'bg-yellow-500/20',
      iconColor: 'text-yellow-400',
      bgPattern: 'bg-cyber-grid',
    },
    {
      title: 'Categories',
      value: stats.categoriesCount || 0,
      change: 'Active',
      trend: 'up',
      icon: Layers,
      gradient: 'from-purple-500 via-violet-600 to-indigo-500',
      glowColor: 'shadow-glow-purple',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400',
      bgPattern: 'bg-cyber-grid',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((card, index) => (
        <div
          key={index}
          className="group relative animate-fade-in-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Glassmorphic Card */}
          <div
            className={`
              relative overflow-hidden
              bg-white/10 dark:bg-gray-900/50
              backdrop-blur-xl
              border border-white/20 dark:border-gray-700/50
              rounded-2xl
              p-6
              transition-all duration-500 ease-smooth
              hover:scale-105
              hover:border-white/40 dark:hover:border-gray-600/50
              ${card.glowColor}
              hover:shadow-xl
              cursor-pointer
            `}
          >
            {/* Background Pattern */}
            <div className={`absolute inset-0 ${card.bgPattern} opacity-5`} />

            {/* Gradient Overlay */}
            <div className={`
              absolute inset-0 
              bg-gradient-to-br ${card.gradient}
              opacity-0 group-hover:opacity-10
              transition-opacity duration-500
            `} />

            {/* Content */}
            <div className="relative z-10">
              {/* Icon & Trend */}
              <div className="flex items-start justify-between mb-4">
                {/* Icon */}
                <div className={`
                  relative
                  p-3 rounded-xl
                  ${card.iconBg}
                  backdrop-blur-sm
                  group-hover:scale-110
                  transition-transform duration-300
                `}>
                  <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                  
                  {/* Sparkle Effect on Hover */}
                  <Sparkles className="
                    absolute -top-1 -right-1 h-3 w-3 
                    text-cyber-cyan
                    opacity-0 group-hover:opacity-100
                    animate-pulse-slow
                    transition-opacity duration-300
                  " />
                </div>

                {/* Trend Badge */}
                <div className={`
                  flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold
                  ${card.trend === 'up' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                  }
                `}>
                  {card.trend === 'up' ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  <span>{card.change}</span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                {card.title}
              </h3>

              {/* Value */}
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {card.value}
              </p>

              {/* Bottom Glow Line */}
              <div className={`
                h-1 w-0 group-hover:w-full
                bg-gradient-to-r ${card.gradient}
                rounded-full
                transition-all duration-500
                mt-4
              `} />
            </div>

            {/* Floating Particles on Hover */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`
                    absolute w-1 h-1 rounded-full
                    bg-gradient-to-r ${card.gradient}
                    animate-float
                  `}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: `${3 + i}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* AI Insight Badge (appears on hover) */}
          <div className="
            absolute -bottom-2 left-1/2 -translate-x-1/2
            opacity-0 group-hover:opacity-100
            transition-all duration-300
            transform group-hover:translate-y-0 translate-y-2
          ">
            <div className="
              px-3 py-1 
              bg-gradient-to-r from-cyber-cyan to-cyber-purple
              text-white text-xs font-semibold
              rounded-full
              shadow-glow-cyan
              whitespace-nowrap
            ">
              AI Powered
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
