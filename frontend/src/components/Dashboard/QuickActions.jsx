import { 
  FileUp, 
  Package, 
  MessageSquare, 
  Sheet, 
  ArrowRight,
  Sparkles 
} from 'lucide-react';

const QuickActions = ({ onUploadFile, onViewInventory, onOpenAI }) => {
  const actions = [
    {
      title: 'Upload File',
      description: 'Add inventory data',
      icon: FileUp,
      onClick: onUploadFile,
    },
    {
      title: 'View Inventory',
      description: 'Browse all items',
      icon: Package,
      onClick: onViewInventory,
    },
    {
      title: 'AI Assistant',
      description: 'Get smart insights',
      icon: MessageSquare,
      onClick: onOpenAI,
      highlight: true, // Special AI highlight
    },
    {
      title: 'Google Sheets',
      description: 'Sync with sheets',
      icon: Sheet,
      onClick: () => window.location.href = '/sheets',
    },
  ];

  return (
    <div className="
      bg-white/10 dark:bg-gray-900/50
      backdrop-blur-xl
      border border-white/20 dark:border-gray-700/50
      rounded-2xl
      p-6
      animate-fade-in
    ">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h3>
        <Sparkles className="h-5 w-5 text-cyber-cyan animate-pulse-slow" />
      </div>

      {/* Actions Grid */}
      <div className="space-y-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`
              group w-full
              bg-white/5 dark:bg-gray-800/50
              hover:bg-white/10 dark:hover:bg-gray-800/80
              border border-white/10 dark:border-gray-700/50
              ${action.highlight ? 'hover:border-cyber-cyan/50' : 'hover:border-blue-500/50'}
              rounded-xl
              p-4
              transition-all duration-300
              hover:scale-105
              ${action.highlight ? 'hover:shadow-glow-cyan' : ''}
            `}
          >
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className={`
                p-3 rounded-xl
                ${action.highlight 
                  ? 'bg-gradient-to-br from-cyber-cyan/20 to-blue-500/20' 
                  : 'bg-blue-500/20'
                }
                group-hover:scale-110
                transition-transform duration-300
              `}>
                <action.icon className={`
                  h-5 w-5 
                  ${action.highlight ? 'text-cyber-cyan' : 'text-blue-400'}
                `} />
              </div>

              {/* Content */}
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900 dark:text-white mb-0.5">
                  {action.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {action.description}
                </p>
              </div>

              {/* Arrow */}
              <ArrowRight className="
                h-5 w-5 
                text-gray-400 
                group-hover:text-cyber-cyan
                group-hover:translate-x-1
                transition-all duration-300
              " />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
