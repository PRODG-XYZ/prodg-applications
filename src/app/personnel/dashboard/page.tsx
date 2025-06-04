'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PersonnelDashboard from '@/components/personnel/PersonnelDashboard';
import { DashboardData } from '@/lib/personnel/dashboard';
import { AlertCircle, Loader2 } from 'lucide-react';

const PersonnelDashboardPage = () => {
  const searchParams = useSearchParams();
  const personnelId = searchParams.get('personnelId');
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!personnelId) {
        setError('Personnel ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/personnel/dashboard?personnelId=${personnelId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch dashboard data');
        }

        const data = await response.json();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [personnelId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Loading Dashboard</h2>
          <p className="text-slate-400">Fetching personnel data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-8 max-w-md mx-auto">
          <div className="flex items-center gap-3 text-red-400 mb-4">
            <AlertCircle className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Error Loading Dashboard</h2>
          </div>
          <p className="text-red-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Data Available</h2>
          <p className="text-slate-400">Unable to load dashboard data for this personnel.</p>
        </div>
      </div>
    );
  }

  return (
    <PersonnelDashboard
      personnel={dashboardData.personnel}
      projects={dashboardData.projects}
      tasks={dashboardData.tasks}
      metrics={dashboardData.metrics}
      recentActivity={dashboardData.recentActivity}
    />
  );
};

export default PersonnelDashboardPage; 