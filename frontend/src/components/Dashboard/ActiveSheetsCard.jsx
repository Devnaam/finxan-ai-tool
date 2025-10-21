import { Sheet, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ActiveSheetsCard = ({ activeSheets, activeCount }) => {
  const navigate = useNavigate();

  if (activeCount === 0) {
    return null;
  }

  return (
    <div className="
      bg-gradient-to-r from-cyber-cyan/10 to-blue-500/10
      backdrop-blur-xl
      border border-cyber-cyan/30
      rounded-2xl
      p-6
      animate-slide-down
    ">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="
            p-3 rounded-xl
            bg-gradient-to-br from-cyber-cyan/20 to-blue-500/20
            border border-cyber-cyan/30
          ">
            <Sheet className="h-6 w-6 text-cyber-cyan" />
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Google Sheets Connected
              </h3>
              <CheckCircle2 className="h-5 w-5 text-teal-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {activeCount} {activeCount === 1 ? 'sheet' : 'sheets'} actively syncing: {' '}
              <span className="font-medium text-cyber-cyan">
                {activeSheets.map(s => s.sheetName).join(', ')}
              </span>
            </p>
          </div>
        </div>

        {/* Manage Button */}
        <button
          onClick={() => navigate('/sheets')}
          className="
            px-4 py-2
            bg-cyber-cyan/20
            hover:bg-cyber-cyan/30
            border border-cyber-cyan/30
            text-cyber-cyan
            rounded-xl
            font-medium
            flex items-center gap-2
            transition-all duration-300
            hover:scale-105
          "
        >
          Manage
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default ActiveSheetsCard;
