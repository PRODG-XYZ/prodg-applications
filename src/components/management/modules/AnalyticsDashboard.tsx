'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  CheckSquare, 
  AlertCircle,
  Calendar,
  Target,
  Award,
  Activity,
  BarChart3,
  PieChart,
  Loader2,
  Download,
  RefreshCw,
  FileText
} from 'lucide-react';

interface PersonnelAnalytics {
  totalPersonnel: number;
  activePersonnel: number;
  departmentBreakdown: { department: string; count: number }[];
  roleDistribution: { role: string; count: number }[];
  averageTenure: number;
  onboardingStats: {
    totalOnboarding: number;
    averageProgress: number;
    completedThisMonth: number;
  };
  performanceMetrics: {
    averageProductivity: number;
    tasksCompletedThisMonth: number;
    projectsActive: number;
    hoursLoggedThisMonth: number;
  };
  applicationStats: {
    totalApplications: number;
    pendingApplications: number;
    approvedThisMonth: number;
    rejectedThisMonth: number;
    averageProcessingTime: number;
  };
}

const MetricCard = ({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  color, 
  trend, 
  description 
}: { 
  title: string; 
  value: number | string; 
  unit?: string; 
  icon: any; 
  color: string; 
  trend?: { value: number; isPositive: boolean };
  description?: string;
}) => (
  <Card className="bg-slate-800/50 border-slate-700/50 p-6">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-sm ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
          <TrendingUp className={`w-4 h-4 ${trend.isPositive ? '' : 'rotate-180'}`} />
          {Math.abs(trend.value)}%
        </div>
      )}
    </div>
    <div className="space-y-2">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {unit && <span className="text-slate-400 text-sm">{unit}</span>}
      </div>
      <p className="text-lg font-medium text-slate-200">{title}</p>
      {description && <p className="text-sm text-slate-400">{description}</p>}
    </div>
  </Card>
);

const ChartCard = ({ 
  title, 
  children, 
  icon: Icon 
}: { 
  title: string; 
  children: React.ReactNode; 
  icon: any;
}) => (
  <Card className="bg-slate-800/50 border-slate-700/50 p-6">
    <div className="flex items-center gap-3 mb-6">
      <Icon className="w-5 h-5 text-blue-400" />
      <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
    {children}
  </Card>
);

const DepartmentChart = ({ data }: { data: { department: string; count: number }[] }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const percentage = total > 0 ? (item.count / total) * 100 : 0;
        const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
        
        return (
          <div key={item.department} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium">{item.department}</span>
              <span className="text-white font-semibold">{item.count}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${colors[index % colors.length]}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-xs text-slate-400">{percentage.toFixed(1)}% of total</div>
          </div>
        );
      })}
    </div>
  );
};

const RoleDistributionChart = ({ data }: { data: { role: string; count: number }[] }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  return (
    <div className="grid grid-cols-2 gap-4">
      {data.map((item, index) => {
        const percentage = total > 0 ? (item.count / total) * 100 : 0;
        const colors = ['bg-emerald-500', 'bg-cyan-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500'];
        
        return (
          <div key={item.role} className="text-center">
            <div className={`w-16 h-16 rounded-full ${colors[index % colors.length]} mx-auto mb-2 flex items-center justify-center`}>
              <span className="text-white font-bold text-lg">{item.count}</span>
            </div>
            <div className="text-sm font-medium text-white capitalize">{item.role}</div>
            <div className="text-xs text-slate-400">{percentage.toFixed(1)}%</div>
          </div>
        );
      })}
    </div>
  );
};

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<PersonnelAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setError(null);
      const [personnelResponse, applicationsResponse] = await Promise.all([
        fetch('/api/admin/analytics'),
        fetch('/api/admin/applications/stats')
      ]);
      
      if (!personnelResponse.ok) {
        throw new Error('Failed to fetch personnel analytics');
      }

      const personnelData = await personnelResponse.json();
      const applicationsData = applicationsResponse.ok ? await applicationsResponse.json() : null;
      
      // Transform the data into the enhanced format
      const enhancedAnalytics: PersonnelAnalytics = {
        totalPersonnel: personnelData.totalPersonnel || 0,
        activePersonnel: personnelData.activePersonnel || 0,
        departmentBreakdown: personnelData.departmentBreakdown || [],
        roleDistribution: personnelData.roleDistribution || [],
        averageTenure: personnelData.averageTenure || 0,
        onboardingStats: {
          totalOnboarding: (personnelData.totalPersonnel || 0) - (personnelData.activePersonnel || 0),
          averageProgress: 65, // Mock data - would come from real calculations
          completedThisMonth: 2 // Mock data
        },
        performanceMetrics: {
          averageProductivity: 78, // Mock data
          tasksCompletedThisMonth: 45, // Mock data
          projectsActive: 8, // Mock data
          hoursLoggedThisMonth: 320 // Mock data
        },
        applicationStats: {
          totalApplications: applicationsData?.stats?.total || 0,
          pendingApplications: applicationsData?.stats?.pending || 0,
          approvedThisMonth: applicationsData?.stats?.approved || 0,
          rejectedThisMonth: applicationsData?.stats?.rejected || 0,
          averageProcessingTime: 3.5 // Mock data - days
        }
      };
      
      setAnalytics(enhancedAnalytics);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting analytics data...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Loading Analytics</h3>
          <p className="text-slate-400">Calculating insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-900/20 border-red-500 p-6">
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Error Loading Analytics</h3>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Analytics Data</h3>
        <p className="text-slate-400">Unable to load analytics at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-slate-400">
          Last updated: {new Date().toLocaleString()}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="bg-slate-700/50 border-slate-600 text-white"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            className="bg-slate-700/50 border-slate-600 text-white"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Personnel"
          value={analytics.totalPersonnel}
          icon={Users}
          color="bg-blue-600"
          trend={{ value: 12, isPositive: true }}
          description="All active and onboarding"
        />
        <MetricCard
          title="Active Personnel"
          value={analytics.activePersonnel}
          icon={CheckSquare}
          color="bg-green-600"
          trend={{ value: 8, isPositive: true }}
          description="Fully onboarded"
        />
        <MetricCard
          title="Total Applications"
          value={analytics.applicationStats.totalApplications}
          icon={FileText}
          color="bg-purple-600"
          trend={{ value: 15, isPositive: true }}
          description="All time applications"
        />
        <MetricCard
          title="Avg. Processing Time"
          value={analytics.applicationStats.averageProcessingTime}
          unit="days"
          icon={Clock}
          color="bg-orange-600"
          trend={{ value: 10, isPositive: false }}
          description="Application to decision"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Department Distribution" icon={PieChart}>
          <DepartmentChart data={analytics.departmentBreakdown} />
        </ChartCard>

        <ChartCard title="Role Distribution" icon={BarChart3}>
          <RoleDistributionChart data={analytics.roleDistribution} />
        </ChartCard>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Application Pipeline
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Pending</span>
              <span className="text-yellow-400">{analytics.applicationStats.pendingApplications}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Approved This Month</span>
              <span className="text-green-400">{analytics.applicationStats.approvedThisMonth}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Rejected This Month</span>
              <span className="text-red-400">{analytics.applicationStats.rejectedThisMonth}</span>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Growth Metrics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Personnel Growth</span>
              <span className="text-green-400">+12% this quarter</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Retention Rate</span>
              <span className="text-green-400">95%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Avg. Tenure</span>
              <span className="text-white">{Math.round(analytics.averageTenure)} days</span>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            Performance
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Productivity Score</span>
              <span className="text-white">{analytics.performanceMetrics.averageProductivity}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tasks Completed</span>
              <span className="text-white">{analytics.performanceMetrics.tasksCompletedThisMonth}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Active Projects</span>
              <span className="text-white">{analytics.performanceMetrics.projectsActive}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 