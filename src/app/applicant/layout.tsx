'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { LogOut, MessageSquare, User, FileText, BarChart3 } from 'lucide-react';

/**
 * Applicant Dashboard Layout
 * Provides navigation and consistent styling for all applicant pages
 */

interface ApplicantLayoutProps {
  children: ReactNode;
}

export default function ApplicantLayout({ children }: ApplicantLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation Header */}
      <nav className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <Link href="/applicant/dashboard" className="text-xl font-bold text-white">
                ProdG Applications
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/applicant/dashboard"
                className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
              >
                <BarChart3 size={18} />
                <span>Dashboard</span>
              </Link>
              
              <Link
                href="/applicant/application"
                className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
              >
                <FileText size={18} />
                <span>My Application</span>
              </Link>
              
              <Link
                href="/applicant/messages"
                className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
              >
                <MessageSquare size={18} />
                <span>Messages</span>
              </Link>

              {/* Logout Button */}
              <LogoutButton />
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <MobileNavigation />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

/**
 * Logout Button Component
 * Handles applicant logout functionality
 */
function LogoutButton() {
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/applicant/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        // Redirect to login page
        window.location.href = '/applicant/auth/request-access';
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center space-x-2 text-slate-300 hover:text-red-400 transition-colors"
    >
      <LogOut size={18} />
      <span>Logout</span>
    </button>
  );
}

/**
 * Mobile Navigation Component
 * Responsive navigation for mobile devices
 */
function MobileNavigation() {
  return (
    <div className="relative">
      {/* Mobile menu button - you can implement dropdown logic here */}
      <button className="text-slate-300 hover:text-white">
        <User size={24} />
      </button>
      
      {/* Mobile menu dropdown - implement state management for show/hide */}
      {/* This would typically use useState to manage visibility */}
    </div>
  );
} 