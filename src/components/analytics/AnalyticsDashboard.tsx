'use client';

import { useState } from 'react';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { AnalyticsFilters } from '@/lib/analytics/queries';
import MetricsCard from './MetricsCard';
import ApplicationChart from './ApplicationChart';
import StatusDistribution from './StatusDistribution';
import GeographicChart from './GeographicChart';
import SkillsAnalysis from './SkillsAnalysis';
import FilterPanel from './FilterPanel';
import { subDays } from 'date-fns';

export default function AnalyticsDashboard() {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    startDate: subDays(new Date(), 30), // Default to last 30 days
    endDate: new Date(),
  });

  const { metrics, applications, skills, loading, error, refetch } = useAnalytics({
    filters,
    refreshInterval: 300000, // 5 minutes
  });

  const handleFiltersChange = (newFilters: AnalyticsFilters) => {
    setFilters(newFilters);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Analytics</h2>
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-slate-400 mt-2">
              Data-driven insights for application management
            </p>
          </div>
          
          <button
            onClick={refetch}
            disabled={loading}
            className="bg-slate-700/50 hover:bg-slate-600/50 text-white px-4 py-2 rounded-lg 
                     transition-colors border border-slate-600/30 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>

        {/* Filters */}
        <FilterPanel filters={filters} onFiltersChange={handleFiltersChange} />

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-700/30 rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-slate-600 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-slate-600 rounded w-full"></div>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {/* KPI Metrics */}
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricsCard
                  title="Total Applications"
                  value={metrics.totalApplications}
                  change={metrics.periodChange.totalApplications}
                  icon="📊"
                />
                <MetricsCard
                  title="Pending Reviews"
                  value={metrics.pendingReviews}
                  change={metrics.periodChange.pendingReviews}
                  icon="⏳"
                />
                <MetricsCard
                  title="Approval Rate"
                  value={`${metrics.approvalRate.toFixed(1)}%`}
                  change={metrics.periodChange.approvalRate}
                  icon="✅"
                  isPercentage
                />
                <MetricsCard
                  title="Avg Response Time"
                  value={`${metrics.averageResponseTime.toFixed(1)}h`}
                  icon="⚡"
                />
              </div>
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Application Trends */}
              {applications && (
                <ApplicationChart
                  data={applications.trends}
                  loading={loading}
                  title="Application Submissions Over Time"
                />
              )}

              {/* Status Distribution */}
              {applications && (
                <StatusDistribution
                  data={applications.statusDistribution}
                  loading={loading}
                />
              )}

              {/* Geographic Distribution */}
              {applications && (
                <GeographicChart
                  data={applications.geographicDistribution}
                  loading={loading}
                />
              )}

              {/* Skills Analysis */}
              {skills && (
                <SkillsAnalysis
                  data={skills}
                  loading={loading}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 