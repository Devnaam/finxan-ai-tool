import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Mail } from 'lucide-react';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../config/firebase';
import toast from 'react-hot-toast';
import { useState } from 'react';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const [resending, setResending] = useState(false);

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await sendEmailVerification(auth.currentUser);
      toast.success('Verification email sent! Check your inbox.');
    } catch (error) {
      toast.error('Failed to send verification email');
    } finally {
      setResending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Check if email is verified
  if (!currentUser.emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="mx-auto h-16 w-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Email Verification Required
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please verify your email address to access the dashboard.
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900 dark:text-blue-300">
                <Mail className="inline h-4 w-4 mr-1" />
                Check your email: <strong>{currentUser.email}</strong>
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="btn-primary w-full"
              >
                I've Verified - Refresh
              </button>
              
              <button
                onClick={handleResendVerification}
                disabled={resending}
                className="btn-secondary w-full"
              >
                {resending ? 'Sending...' : 'Resend Verification Email'}
              </button>
              
              <button
                onClick={() => {
                  auth.signOut();
                  window.location.href = '/login';
                }}
                className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                Sign out
              </button>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
              Didn't receive the email? Check your spam folder.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
