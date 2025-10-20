import { useState } from 'react';
import { Save, Key, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SecuritySettings = () => {
  const [saving, setSaving] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [errors, setErrors] = useState({});

  const validatePasswords = () => {
    const newErrors = {};

    if (!passwords.current) {
      newErrors.current = 'Current password is required';
    }

    if (!passwords.new) {
      newErrors.new = 'New password is required';
    } else if (passwords.new.length < 6) {
      newErrors.new = 'Password must be at least 6 characters';
    }

    if (!passwords.confirm) {
      newErrors.confirm = 'Please confirm your password';
    } else if (passwords.new !== passwords.confirm) {
      newErrors.confirm = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validatePasswords()) return;

    setSaving(true);
    try {
      const response = await api.put('/settings/password', {
        currentPassword: passwords.current,
        newPassword: passwords.new
      });

      if (response.success) {
        toast.success('Password updated successfully!');
        setPasswords({ current: '', new: '', confirm: '' });
        setErrors({});
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
          Security Settings
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Manage your password and security preferences
        </p>
      </div>

      {/* Security Info Alert */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
            Password Requirements
          </p>
          <ul className="text-sm text-blue-800 dark:text-blue-400 mt-2 space-y-1 list-disc list-inside">
            <li>At least 6 characters long</li>
            <li>Cannot be the same as your current password</li>
          </ul>
        </div>
      </div>

      {/* Password Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Password
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="password"
              value={passwords.current}
              onChange={(e) => handleChange('current', e.target.value)}
              placeholder="Enter current password"
              className={`input-field pl-11 ${errors.current ? 'border-red-500 focus:ring-red-500' : ''}`}
            />
          </div>
          {errors.current && (
            <p className="text-sm text-red-600 mt-1">{errors.current}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            New Password
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="password"
              value={passwords.new}
              onChange={(e) => handleChange('new', e.target.value)}
              placeholder="Enter new password"
              className={`input-field pl-11 ${errors.new ? 'border-red-500 focus:ring-red-500' : ''}`}
            />
          </div>
          {errors.new && (
            <p className="text-sm text-red-600 mt-1">{errors.new}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => handleChange('confirm', e.target.value)}
              placeholder="Confirm new password"
              className={`input-field pl-11 ${errors.confirm ? 'border-red-500 focus:ring-red-500' : ''}`}
            />
          </div>
          {errors.confirm && (
            <p className="text-sm text-red-600 mt-1">{errors.confirm}</p>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleSave}
          disabled={saving || !passwords.current || !passwords.new || !passwords.confirm}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              Updating...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Update Password
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SecuritySettings;
