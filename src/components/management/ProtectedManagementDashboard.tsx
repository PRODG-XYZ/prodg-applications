'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ManagementDashboard from '@/components/management/ManagementDashboard';
import LoginForm from '@/components/LoginForm';
import { Button } from '@/components/ui/button';

export default function ProtectedManagementDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // Check authentication status on component mount
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/status');
      setIsAuthenticated(response.ok);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (username: string, accessCode: string): Promise<boolean> => {
    try {
      setLoginError('');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, accessCode }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        return true;
      } else {
        const data = await response.json();
        setLoginError(data.error || 'Authentication failed');
        return false;
      }
    } catch {
      setLoginError('Network error. Please try again.');
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      setIsAuthenticated(false);
      setLoginError('');
    } catch {
      console.error('Logout error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} error={loginError} />;
  }

  return (
    <div className="relative min-h-screen">
      {/* Header with logout button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-0 right-0 z-50 p-6"
      >
        <div className="flex justify-end">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800/20 backdrop-blur-lg rounded-2xl border border-slate-700/30 p-1"
          >
            <Button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500/80 to-red-600/80 hover:from-red-500 hover:to-red-600 text-white border-0 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-red-500/25"
              size="sm"
            >
              Logout
            </Button>
          </motion.div>
        </div>
      </motion.div>
      
      <ManagementDashboard />
    </div>
  );
} 