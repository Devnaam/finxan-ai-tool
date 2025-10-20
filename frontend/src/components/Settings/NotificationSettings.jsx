import { useState, useEffect } from 'react';
import { Save, Bell, FileText, Calendar } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const NotificationSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    lowStock: true,
    newFiles: true,
    weeklyReport: false,
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await api.get('/settings/notifications');
      if (response.success) {
        setPreferences(response.preferences);
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.put('/settings/notifications', preferences);
      
      if (response.success) {
        toast.success('Notification preferences updated!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update preferences');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const togglePreference = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const notificationOptions = [
    {
      key: 'lowStock',
      icon: Bell,
      title: 'Low Stock Alerts',
      description: 'Get notified when items are running low',
      color: 'text-yellow-600',
    },
    {
      key: 'newFiles',
      icon: FileText,
      title: 'New File Uploads',
      description: 'Notifications for successful file uploads',
      color: 'text-blue-600',
    },
    {
      key: 'weeklyReport',
      icon: Calendar,
      title: 'Weekly Reports',
      description: 'Receive weekly inventory summary reports',
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
          Notification Preferences
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose what notifications you want to receive
        </p>
      </div>

      <div className="space-y-4">
        {notificationOptions.map((option) => (
          <div
            key={option.key}
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <option.icon className={`h-6 w-6 ${option.color}`} />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {option.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {option.description}
                </p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences[option.key]}
                onChange={() => togglePreference(option.key)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
