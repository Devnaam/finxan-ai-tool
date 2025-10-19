import { FileText, CheckCircle, Clock, AlertCircle, ExternalLink } from 'lucide-react';

const RecentFiles = ({ files, onViewAll }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      processing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.processing}`}>
        {getStatusIcon(status)}
        {status}
      </span>
    );
  };

  const getFileTypeColor = (fileType) => {
    const colors = {
      xlsx: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      csv: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      pdf: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      json: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    };
    return colors[fileType?.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  };

  if (!files || files.length === 0) {
    return (
      <div className="card h-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-600" />
            Recent Files
          </h3>
        </div>
        
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No files uploaded yet
          </h4>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Start by uploading your first inventory file
          </p>
          <button className="btn-primary">
            <FileText className="h-5 w-5 mr-2" />
            Upload Your First File
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary-600" />
          Recent Files ({files.length})
        </h3>
        <button 
          onClick={onViewAll}
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
        >
          View All
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>
      
      <div className="space-y-3">
        {files.slice(0, 5).map((file) => (
          <div
            key={file._id}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg group-hover:scale-110 transition-transform">
                <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {file.fileName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getFileTypeColor(file.fileType)}`}>
                    {file.fileType?.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(file.uploadedAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
            <div className="ml-4">
              {getStatusBadge(file.status)}
            </div>
          </div>
        ))}
      </div>

      {files.length > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button 
            onClick={onViewAll}
            className="w-full btn-secondary text-center"
          >
            View All {files.length} Files
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentFiles;
