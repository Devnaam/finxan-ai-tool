import { Sheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ActiveSheetsCard = ({ activeSheets, activeCount }) => {
  const navigate = useNavigate();

  if (activeCount === 0) {
    return (
      <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">No Active Google Sheets</h3>
            <p className="text-blue-100 text-sm mt-1">
              Connect and activate Google Sheets to sync your inventory data automatically
            </p>
          </div>
          <button
            onClick={() => navigate('/google-sheets')}
            className="btn-secondary bg-white text-blue-600 hover:bg-blue-50"
          >
            Connect Sheets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white/20 rounded-xl">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sheet className="h-5 w-5" />
            {activeCount} Active Sheet{activeCount > 1 ? 's' : ''}
          </h3>
          <p className="text-green-100 text-sm mt-1">
            {activeSheets.map(s => s.sheetName).join(', ')}
          </p>
        </div>
        <button
          onClick={() => navigate('/google-sheets')}
          className="btn-secondary bg-white text-green-600 hover:bg-green-50"
        >
          Manage Sheets
        </button>
      </div>
    </div>
  );
};

export default ActiveSheetsCard;
