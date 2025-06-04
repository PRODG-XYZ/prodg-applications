'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bug, ChevronUp, ChevronDown, Home, User, Users, Settings, UserPlus, AlertCircle, RefreshCw, LogIn, Mail, X, Loader, CheckCircle } from 'lucide-react';

export default function DebugNavbar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [conversionStatus, setConversionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginStatus, setLoginStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [loginMessage, setLoginMessage] = useState('');

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/applicant/dashboard', label: 'Applicant Dashboard', icon: User },
    { href: '/personnel/dashboard?personnelId=current', label: 'My Personnel', icon: Users },
    { href: '/debug/personnel', label: 'Debug Personnel', icon: Bug },
    { href: '/admin/applications', label: 'Admin Apps', icon: Settings },
    { href: '/admin/personnel', label: 'Admin Personnel', icon: Users },
    { href: '/dashboard', label: 'Admin Dashboard', icon: Settings },
  ];

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail) {
      setLoginMessage('Please enter your email address');
      setLoginStatus('error');
      return;
    }

    setLoginStatus('loading');
    setLoginMessage('Sending access link...');

    try {
      const response = await fetch('/api/applicant/auth/request-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: loginEmail }),
      });

      const data = await response.json();

      if (data.success) {
        setLoginStatus('success');
        setLoginMessage(data.message || 'Access link sent! Check your email.');
      } else {
        setLoginStatus('error');
        setLoginMessage(data.message || 'Failed to send access link.');
      }
    } catch (error) {
      setLoginStatus('error');
      setLoginMessage('An error occurred. Please try again.');
      console.error('Request access error:', error);
    }
  };

  const handleFixPersonnelConversion = async () => {
    try {
      setConversionStatus('loading');
      setStatusMessage('Fetching current user...');
      
      // First get the current user's application status
      const response = await fetch('/api/applicant/dashboard');
      
      if (!response.ok) {
        throw new Error('Failed to fetch current user');
      }
      
      const dashboardData = await response.json();
      const userEmail = dashboardData.application.email;
      const userName = dashboardData.application.name;
      
      if (!userEmail) {
        throw new Error('No user is currently logged in');
      }
      
      setStatusMessage(`Converting ${userName}...`);
      
      // Now try to convert this user to personnel
      const convertResponse = await fetch('/api/debug/convert-applicant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          employeeId: `EMP${Date.now().toString().slice(-6)}`,
          department: 'Engineering',
          role: 'employee'
        })
      });
      
      if (!convertResponse.ok) {
        const errorData = await convertResponse.json();
        throw new Error(errorData.error || 'Failed to convert to personnel');
      }
      
      const result = await convertResponse.json();
      
      if (result.message && result.message.includes('already exists')) {
        setStatusMessage('Personnel record already exists');
      } else {
        setStatusMessage('Successfully converted to personnel');
      }
      
      setConversionStatus('success');
      
      // Reload the page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error fixing personnel conversion:', error);
      setStatusMessage(error instanceof Error ? error.message : 'An error occurred');
      setConversionStatus('error');
    }
  };

  const handleGoToPersonnelDashboard = async () => {
    try {
      // First check if the user has a personnel record
      const checkResponse = await fetch('/api/applicant/personnel-status');
      
      if (!checkResponse.ok) {
        throw new Error('Failed to check personnel status');
      }
      
      const statusData = await checkResponse.json();
      
      if (!statusData.isPersonnel || !statusData.personnel?._id) {
        alert('No personnel record found. Please use the "Fix Personnel Conversion" button first.');
        return;
      }
      
      // Navigate to the personnel dashboard with the correct ID
      window.location.href = `/personnel/dashboard?personnelId=${statusData.personnel._id}`;
      
    } catch (error) {
      console.error('Error navigating to personnel dashboard:', error);
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <>
      <div id="debug-navbar" className="fixed bottom-4 right-4 z-50">
        <div 
          className={`bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700 transition-all duration-300 overflow-hidden ${
            isExpanded ? 'max-h-[350px]' : 'max-h-[50px]'
          }`}
        >
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full px-4 py-3 text-white"
          >
            <div className="flex items-center">
              <Bug className="w-5 h-5 text-yellow-400 mr-2" />
              <span className="text-sm font-medium">Debug Nav</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {isExpanded && (
            <div className="px-2 pb-2">
              <div className="space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center px-3 py-2 text-sm text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
                    >
                      <Icon className="w-4 h-4 mr-3 text-gray-400" />
                      {link.label}
                    </Link>
                  );
                })}
                
                {/* Applicant Login Button */}
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center w-full px-3 py-2 text-sm rounded-md text-left transition-colors bg-green-900/20 text-green-300 hover:bg-green-900/40"
                >
                  <LogIn className="w-4 h-4 mr-3 text-green-400" />
                  <span>Applicant Login</span>
                </button>
                
                {/* Fix Personnel Conversion Button */}
                <button
                  onClick={handleFixPersonnelConversion}
                  disabled={conversionStatus === 'loading'}
                  className={`flex items-center w-full px-3 py-2 text-sm rounded-md text-left transition-colors ${
                    conversionStatus === 'loading' 
                      ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed' 
                      : conversionStatus === 'success'
                      ? 'bg-green-900/30 text-green-300 hover:bg-green-900/50'
                      : conversionStatus === 'error'
                      ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50'
                      : 'bg-indigo-900/20 text-indigo-300 hover:bg-indigo-900/40'
                  }`}
                >
                  <UserPlus className="w-4 h-4 mr-3 text-indigo-400" />
                  {conversionStatus === 'loading' ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {statusMessage}
                    </div>
                  ) : (
                    <span>
                      {conversionStatus === 'idle' ? 'Fix Personnel Conversion' : statusMessage}
                    </span>
                  )}
                </button>
                
                {/* Quick Reload Button */}
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center w-full px-3 py-2 text-sm rounded-md text-left transition-colors bg-blue-900/20 text-blue-300 hover:bg-blue-900/40"
                >
                  <RefreshCw className="w-4 h-4 mr-3 text-blue-400" />
                  <span>Reload Page</span>
                </button>
                
                {/* Go To My Personnel Dashboard Button */}
                <button
                  onClick={handleGoToPersonnelDashboard}
                  className="flex items-center w-full px-3 py-2 text-sm rounded-md text-left transition-colors bg-purple-900/20 text-purple-300 hover:bg-purple-900/40"
                >
                  <Users className="w-4 h-4 mr-3 text-purple-400" />
                  <span>Go To My Personnel Dashboard</span>
                </button>
                
                <div className="pt-2 mt-2 border-t border-gray-700">
                  <Link
                    href="#"
                    className="flex items-center px-3 py-2 text-sm text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
                    onClick={(e) => {
                      e.preventDefault();
                      localStorage.setItem('debug-navbar-shown', 'false');
                      document.getElementById('debug-navbar')?.remove();
                    }}
                  >
                    <span className="text-red-400">Hide Debug Navbar</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Applicant Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-white">Applicant Login</h2>
              <button 
                onClick={() => {
                  setShowLoginModal(false);
                  setLoginStatus('idle');
                  setLoginMessage('');
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-slate-300 mb-4">
                Enter your email address to receive a secure access link for the applicant dashboard.
              </p>
              
              <form onSubmit={handleRequestAccess} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      id="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Enter your email"
                      required
                      disabled={loginStatus === 'loading'}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginStatus === 'loading'}
                  className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors ${
                    loginStatus === 'loading'
                      ? 'bg-slate-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
                  }`}
                >
                  {loginStatus === 'loading' ? (
                    <>
                      <Loader className="animate-spin" size={18} />
                      <span>Sending Link...</span>
                    </>
                  ) : (
                    <>
                      <Mail size={18} />
                      <span>Send Access Link</span>
                    </>
                  )}
                </button>
              </form>
              
              {/* Status Message */}
              {loginMessage && (
                <div className={`mt-4 p-3 rounded-lg flex items-start space-x-3 ${
                  loginStatus === 'success' 
                    ? 'bg-green-900/20 border border-green-900/30' 
                    : loginStatus === 'error'
                    ? 'bg-red-900/20 border border-red-900/30'
                    : 'bg-blue-900/20 border border-blue-900/30'
                }`}>
                  {loginStatus === 'success' ? (
                    <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={16} />
                  ) : loginStatus === 'error' ? (
                    <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
                  ) : (
                    <Mail className="text-blue-400 flex-shrink-0 mt-0.5" size={16} />
                  )}
                  <p className={`text-sm ${
                    loginStatus === 'success' 
                      ? 'text-green-400' 
                      : loginStatus === 'error'
                      ? 'text-red-400'
                      : 'text-blue-400'
                  }`}>
                    {loginMessage}
                  </p>
                </div>
              )}
              
              {/* Quick Access Links */}
              {loginStatus === 'success' && (
                <div className="mt-4 text-center">
                  <p className="text-slate-400 text-sm mb-2">Check your email for the access link, or:</p>
                  <Link 
                    href="/applicant/auth/request-access" 
                    className="text-cyan-400 hover:text-cyan-300 text-sm"
                    onClick={() => setShowLoginModal(false)}
                  >
                    Go to login page
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
} 