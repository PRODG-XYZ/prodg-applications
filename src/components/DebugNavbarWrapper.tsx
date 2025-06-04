'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

// Dynamically import the debug components to avoid server-side rendering issues
const DebugNavbar = dynamic(() => import('./DebugNavbar'), { ssr: false });
const ApiDebugBar = dynamic(() => import('../app/components/DebugNavBar'), { ssr: false });

export default function DebugNavbarWrapper() {
  // Use a client-only state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  const [showNavbar, setShowNavbar] = useState(false);
  const [showApiDebug, setShowApiDebug] = useState(false);
  const pathname = usePathname();

  // Only run on client-side to prevent hydration issues
  useEffect(() => {
    setMounted(true);
    
    // Check if we're in development mode - only show in development
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
      // Check if user has hidden it before
      const navbarShown = localStorage.getItem('debug-navbar-shown') !== 'false';
      const apiDebugShown = localStorage.getItem('api-debug-shown') !== 'false';
      
      setShowNavbar(navbarShown);
      setShowApiDebug(apiDebugShown);
      
      // Add keyboard shortcut (Ctrl+Shift+D) to toggle debug navbar
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
          e.preventDefault();
          const newState = !showNavbar;
          setShowNavbar(newState);
          localStorage.setItem('debug-navbar-shown', newState.toString());
        }
        
        // Add keyboard shortcut (Ctrl+Shift+A) to toggle API debug bar
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
          e.preventDefault();
          const newState = !showApiDebug;
          setShowApiDebug(newState);
          localStorage.setItem('api-debug-shown', newState.toString());
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [showNavbar, showApiDebug]);
  
  // Don't render anything during SSR
  if (!mounted) return null;
  
  return (
    <>
      {showNavbar && <DebugNavbar />}
      {showApiDebug && <ApiDebugBar />}
    </>
  );
} 