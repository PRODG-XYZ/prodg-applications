'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, AlertCircle, CheckCircle, Loader } from 'lucide-react';

/**
 * Request Access Page
 * Allows applicants to request magic link access to their dashboard
 */
export default function RequestAccessPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Please enter your email address');
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/applicant/auth/request-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        setMessage(data.message);
        setEmail(''); // Clear email field
      } else {
        setIsSuccess(false);
        setMessage(data.message);
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage('An error occurred. Please try again.');
      console.error('Request access error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get error message based on URL parameter
  const getErrorMessage = (errorType: string | null) => {
    switch (errorType) {
      case 'expired':
        return 'Your access link has expired. Please request a new one.';
      case 'invalid':
        return 'Invalid access link. Please request a new one.';
      case 'missing_token':
        return 'Access link is incomplete. Please request a new one.';
      case 'verification_failed':
        return 'Verification failed. Please try requesting access again.';
      default:
        return null;
    }
  };

  const errorMessage = getErrorMessage(error);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Access Your Application
          </h1>
          <p className="text-slate-300">
            Enter your email to receive a secure access link to your application dashboard.
          </p>
        </div>

        {/* Error Message from URL */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-3">
            <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
            <p className="text-red-400 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Enter the email you used to apply"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  <span>Sending Link...</span>
                </>
              ) : (
                <>
                  <Mail size={20} />
                  <span>Send Access Link</span>
                </>
              )}
            </button>
          </form>

          {/* Message Display */}
          {message && (
            <div className={`mt-6 p-4 rounded-lg flex items-center space-x-3 ${
              isSuccess 
                ? 'bg-green-500/10 border border-green-500/20' 
                : 'bg-red-500/10 border border-red-500/20'
            }`}>
              {isSuccess ? (
                <CheckCircle className="text-green-400 flex-shrink-0" size={20} />
              ) : (
                <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
              )}
              <p className={`text-sm ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
                {message}
              </p>
            </div>
          )}

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Don't have an application yet?{' '}
              <a href="/" className="text-cyan-400 hover:text-cyan-300">
                Submit your application
              </a>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            The access link will expire in 15 minutes for security. 
            <br />
            Your session will remain active for 7 days.
          </p>
        </div>
      </div>
    </div>
  );
} 