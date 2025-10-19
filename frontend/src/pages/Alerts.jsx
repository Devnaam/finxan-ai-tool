import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import {
  AlertTriangle,
  AlertCircle,
  XCircle,
  CheckCircle,
  RefreshCw,
  Package,
  Mail,
  Clock,
  X,
  Download,
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Alerts = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    lowStock: 0,
    outOfStock: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('active');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, [filterStatus]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/alerts?status=${filterStatus}`);
      setAlerts(response.alerts || []);
      setStats(response.stats || stats);
    } catch (error) {
      toast.error('Failed to load alerts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAlerts = async () => {
    setGenerating(true);
    try {
      const response = await api.post('/alerts/generate');
      toast.success(response.message || 'Alerts generated successfully');
      fetchAlerts();
    } catch (error) {
      toast.error('Failed to generate alerts');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await api.patch(`/alerts/${alertId}`, { status: 'resolved' });
      toast.success('Alert marked as resolved');
      fetchAlerts();
    } catch (error) {
      toast.error('Failed to resolve alert');
    }
  };

  const handleDismissAlert = async (alertId) => {
    try {
      await api.patch(`/alerts/${alertId}`, { status: 'dismissed' });
      toast.success('Alert dismissed');
      fetchAlerts();
    } catch (error) {
      toast.error('Failed to dismiss alert');
    }
  };

  const handleDismissAll = async () => {
    if (!confirm('Are you sure you want to dismiss all active alerts?')) return;
    
    try {
      await api.post('/alerts/dismiss-all');
      toast.success('All alerts dismissed');
      fetchAlerts();
    } catch (error) {
      toast.error('Failed to dismiss alerts');
    }
  };

  const handleExportAlerts = () => {
    if (alerts.length === 0) {
      toast.error('No alerts to export');
      return;
    }

    // Convert alerts to CSV
    const csv = [
      ['Product Name', 'SKU', 'Current Quantity', 'Threshold', 'Alert Type', 'Status', 'Created At'].join(','),
      ...alerts.map(alert => [
        `"${alert.productName}"`,
        alert.sku || 'N/A',
        alert.currentQuantity,
        alert.threshold,
        alert.alertType,
        alert.status,
        new Date(alert.createdAt).toLocaleString()
      ].join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `alerts-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    toast.success('Alerts exported to CSV!');
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'out-of-stock':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'low-stock':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'critical':
        return 'from-red-500 to-red-600';
      case 'out-of-stock':
        return 'from-red-400 to-red-500';
      case 'low-stock':
        return 'from-yellow-400 to-yellow-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getAlertBadge = (type) => {
    const styles = {
      critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      'out-of-stock': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      'low-stock': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[type]}`}>
        {getAlertIcon(type)}
        {type.replace('-', ' ')}
      </span>
    );
  };

  const statCards = [
    {
      title: 'Critical Alerts',
      value: stats.critical,
      icon: XCircle,
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
    },
    {
      title: 'Out of Stock',
      value: stats.outOfStock,
      icon: AlertCircle,
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      title: 'Low Stock',
      value: stats.lowStock,
      icon: AlertTriangle,
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      title: 'Total Alerts',
      value: stats.total,
      icon: Package,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              Low Stock Alerts
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitor and manage inventory alerts
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportAlerts}
              disabled={alerts.length === 0}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export alerts to CSV"
            >
              <Download className="h-5 w-5" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={handleGenerateAlerts}
              disabled={generating}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 ${generating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{generating ? 'Scanning...' : 'Scan'}</span>
            </button>
            {alerts.filter(a => a.status === 'active').length > 0 && (
              <button
                onClick={handleDismissAll}
                className="btn-secondary flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <X className="h-5 w-5" />
                <span className="hidden sm:inline">Dismiss All</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <div key={index} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.iconBg} p-3 rounded-xl`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by Status:
            </span>
            <div className="flex flex-wrap gap-2">
              {['active', 'resolved', 'dismissed', 'all'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="card">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading alerts...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No alerts found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {filterStatus === 'active' 
                  ? 'All your inventory items are well stocked!'
                  : `No ${filterStatus} alerts at the moment`}
              </p>
              <button
                onClick={handleGenerateAlerts}
                disabled={generating}
                className="btn-primary"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Scan Inventory Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert._id}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.alertType === 'critical'
                      ? 'border-red-600 bg-red-50 dark:bg-red-900/10'
                      : alert.alertType === 'out-of-stock'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                      : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${getAlertColor(alert.alertType)} flex-shrink-0`}>
                        <Package className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {alert.productName}
                          </h4>
                          {getAlertBadge(alert.alertType)}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">SKU:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-white">
                              {alert.sku || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Current:</span>
                            <span className={`ml-2 font-bold ${
                              alert.currentQuantity === 0 ? 'text-red-600' : 'text-yellow-600'
                            }`}>
                              {alert.currentQuantity} units
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Threshold:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-white">
                              {alert.threshold} units
                            </span>
                          </div>
                          {alert.category && (
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Category:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {alert.category}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(alert.createdAt).toLocaleString()}
                            </span>
                          </div>
                          {alert.emailSent && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-green-500" />
                              <span className="text-xs text-green-600 dark:text-green-400">
                                Email sent
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {alert.status === 'active' && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleResolveAlert(alert._id)}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title="Mark as resolved"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDismissAlert(alert._id)}
                          className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Dismiss"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Alerts;
