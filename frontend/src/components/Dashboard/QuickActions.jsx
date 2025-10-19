import { 
  FileUp, 
  Package, 
  MessageSquare, 
  Sheet,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

const QuickActions = ({ onUploadFile, onViewInventory, onOpenAI }) => {
  const actions = [
    {
      title: 'Upload File',
      description: 'Add new inventory data',
      icon: FileUp,
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      onClick: onUploadFile,
    },
    {
      title: 'View Inventory',
      description: 'Browse all items',
      icon: Package,
      color: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      onClick: onViewInventory,
    },
    {
      title: 'AI Assistant',
      description: 'Get smart insights',
      icon: MessageSquare,
      color: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      onClick: onOpenAI,
    },
    {
      title: 'Google Sheets',
      description: 'Sync with sheets',
      icon: Sheet,
      color: 'from-yellow-500 to-yellow-600',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      onClick: () => window.location.href = '/google-sheets',
    },
    {
      title: 'Analytics',
      description: 'View detailed reports',
      icon: BarChart3,
      color: 'from-pink-500 to-pink-600',
      iconBg: 'bg-pink-100 dark:bg-pink-900/30',
      iconColor: 'text-pink-600 dark:text-pink-400',
      onClick: () => window.location.href = '/analytics',
    },
  ];

  return (
    <div className="card h-full">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Quick Actions
      </h3>

      <div className="space-y-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="w-full group relative overflow-hidden"
          >
            <div className="card hover:shadow-xl transition-all duration-300 p-4">
              <div className="flex items-center gap-4">
                <div className={`${action.iconBg} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                  <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {action.title}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {action.description}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Pro Tip Card */}
      <div className="mt-6 p-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl text-white">
        <h4 className="font-semibold mb-2">💡 Pro Tip</h4>
        <p className="text-sm text-primary-100">
          Use the AI Assistant to get instant insights about your inventory and make data-driven decisions faster.
        </p>
      </div>
    </div>
  );
};

export default QuickActions;
