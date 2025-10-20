import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { uploadProfilePhoto } from '../../config/storage';
import { User, Mail, Save, Camera } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ProfileSettings = () => {
  const { userProfile, setUserProfile, currentUser } = useAuth();
  const [name, setName] = useState(userProfile?.name || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Save profile name in DB
  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      const response = await api.put('/settings/profile', { name: name.trim() });
      if (response.success) {
        setUserProfile(prev => ({
          ...prev,
          name: name.trim(),
        }));
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // Uploads image to Firebase Storage and saves URL to backend
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser?.uid) return toast.error('Missing file or user ID');

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      toast.error('Only JPG and PNG images are allowed');
      return;
    }

    setUploading(true);

    try {
      // 1. Upload to Firebase Storage
      const photoURL = await uploadProfilePhoto(file, currentUser.uid);

      // 2. Save the photo URL with backend (MongoDB and Firebase Auth)
      const response = await api.post('/settings/photo', { photoURL });
      if (response.success) {
        setUserProfile(prev => ({
          ...prev,
          profilePicture: photoURL,
        }));
        toast.success('Profile photo updated!');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to upload photo');
      console.error(error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
          Profile Information
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Update your personal information
        </p>
      </div>

      {/* Profile Photo */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
            {userProfile?.profilePicture ? (
              <img
                src={userProfile.profilePicture}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={e => { e.target.style.display = 'none'; }}
              />
            ) : (
              userProfile?.name?.[0]?.toUpperCase() || 'U'
            )}
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
          )}
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handlePhotoChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-secondary text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Camera className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Change Photo'}
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            JPG, PNG. Max size 2MB
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input-field pl-11"
              placeholder="Enter your full name"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              value={userProfile?.email || ''}
              disabled
              className="input-field pl-11 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Email cannot be changed
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Plan
          </label>
          <div className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
            <div>
              <p className="font-medium text-primary-900 dark:text-primary-300 capitalize">
                {userProfile?.plan || 'Free'} Plan
              </p>
              <p className="text-sm text-primary-700 dark:text-primary-400 mt-1">
                Upgrade for more features
              </p>
            </div>
            <button className="btn-primary">Upgrade</button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleSaveProfile}
          disabled={saving || !name.trim()}
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

export default ProfileSettings;
