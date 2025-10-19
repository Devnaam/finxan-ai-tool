import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, CheckCircle } from 'lucide-react';
import { auth } from '../config/firebase';
import { sendEmailVerification } from 'firebase/auth';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    // Check if email is already verified
    if (user?.emailVerified) {
      setVerified(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  }, [user, navigate]);

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      await sendEmailVerification(user);
      toast.success('Verification email sent! Check your inbox.');
    } catch (error) {
      toast.error('Failed to send email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setLoading(true);
    try {
      await user.reload();
      if (user.emailVerified) {
        setVerified(true);
        toast.success('Email verified successfully!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        toast.error('Email not verified yet. Please check your inbox.');
      }
    } catch (error) {
      toast.error('Failed to check verification status.');
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Email Verified!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full">
        <div className="card text-center">
          <div className="mx-auto h-16 w-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-6">
            <Mail className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Verify Your Email
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We've sent a verification link to:
            <br />
            <span className="font-medium text-gray-900 dark:text-white">
              {user?.email}
            </span>
          </p>

          <div className="space-y-4">
            <button
              onClick={handleCheckVerification}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Checking...' : 'I\'ve Verified My Email'}
            </button>

            <button
              onClick={handleResendEmail}
              disabled={loading}
              className="btn-secondary w-full"
            >
              Resend Verification Email
            </button>

            <button
              onClick={() => navigate('/login')}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Back to Login
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              💡 <strong>Tip:</strong> Check your spam folder if you don't see the email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
