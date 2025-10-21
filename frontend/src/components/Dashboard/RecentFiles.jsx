import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ExternalLink,
  File 
} from 'lucide-react';

const RecentFiles = ({ files, onViewAll }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-teal-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <File className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return badges[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  if (!files || files.length === 0) {
    return (
      <div className="
        bg-white/10 dark:bg-gray-900/50
        backdrop-blur-xl
        border border-white/20 dark:border-gray-700/50
        rounded-2xl
        p-12
        text-center
        animate-fade-in
      ">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          No files uploaded yet
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Start by uploading your first inventory file
        </p>
      </div>
    );
  }

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
          Recent Files
        </h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="
              text-sm font-medium text-cyber-cyan 
              hover:text-blue-400
              flex items-center gap-1
              transition-colors
            "
          >
            View All
            <ExternalLink className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Files List */}
      <div className="space-y-3">
        {files.map((file, index) => (
          <div
            key={file._id || index}
            className="
              group
              bg-white/5 dark:bg-gray-800/50
              hover:bg-white/10 dark:hover:bg-gray-800/80
              border border-white/10 dark:border-gray-700/50
              hover:border-cyber-cyan/30
              rounded-xl
              p-4
              transition-all duration-300
              cursor-pointer
            "
          >
            <div className="flex items-center gap-4">
              {/* Status Icon */}
              <div className="
                p-2.5 rounded-lg
                bg-blue-500/20
                group-hover:scale-110
                transition-transform duration-300
              ">
                {getStatusIcon(file.status)}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate mb-1">
                  {file.fileName || file.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    {new Date(file.uploadedAt || file.createdAt).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>{file.fileSize || 'Unknown size'}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`
                px-3 py-1 rounded-lg
                text-xs font-medium
                border backdrop-blur-sm
                ${getStatusBadge(file.status)}
              `}>
                {file.status || 'Unknown'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentFiles;
