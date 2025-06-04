import React, { useState, useEffect } from 'react';
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
  Loader2
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
  trends: {
    personnelGrowth: { month: string; count: number }[];
    productivityTrend: { month: string; score: number }[];
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
  <div className="bg-slate-800/30 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
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
  </div>
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
  <div className="bg-slate-800/30 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
    <div className="flex items-center gap-3 mb-6">
      <Icon className="w-5 h-5 text-blue-400" />
      <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
    {children}
  </div>
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

const OnboardingProgress = ({ stats }: { stats: PersonnelAnalytics['onboardingStats'] }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-3 gap-4 text-center">
      <div>
        <div className="text-2xl font-bold text-white">{stats.totalOnboarding}</div>
        <div className="text-sm text-slate-400">Currently Onboarding</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-white">{Math.round(stats.averageProgress)}%</div>
        <div className="text-sm text-slate-400">Average Progress</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-white">{stats.completedThisMonth}</div>
        <div className="text-sm text-slate-400">Completed This Month</div>
      </div>
    </div>
    
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">Overall Onboarding Progress</span>
        <span className="text-white">{Math.round(stats.averageProgress)}%</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-3">
        <div 
          className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
          style={{ width: `${stats.averageProgress}%` }}
        />
      </div>
    </div>
  </div>
);

const PerformanceOverview = ({ metrics }: { metrics: PersonnelAnalytics['performanceMetrics'] }) => (
  <div className="grid grid-cols-2 gap-6">
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-slate-400">Avg. Productivity</span>
        <span className="text-white font-semibold">{Math.round(metrics.averageProductivity)}%</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div 
          className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500"
          style={{ width: `${metrics.averageProductivity}%` }}
        />
      </div>
    </div>
    
    <div className="space-y-3">
      <div className="text-center">
        <div className="text-xl font-bold text-white">{metrics.tasksCompletedThisMonth}</div>
        <div className="text-sm text-slate-400">Tasks Completed</div>
      </div>
    </div>
    
    <div className="space-y-3">
      <div className="text-center">
        <div className="text-xl font-bold text-white">{metrics.projectsActive}</div>
        <div className="text-sm text-slate-400">Active Projects</div>
      </div>
    </div>
    
    <div className="space-y-3">
      <div className="text-center">
        <div className="text-xl font-bold text-white">{Math.round(metrics.hoursLoggedThisMonth)}</div>
        <div className="text-sm text-slate-400">Hours This Month</div>
      </div>
    </div>
  </div>
);

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<PersonnelAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/analytics');
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }

        const data = await response.json();
        
        // Transform the basic analytics data into the enhanced format
        const enhancedAnalytics: PersonnelAnalytics = {
          totalPersonnel: data.totalPersonnel,
          activePersonnel: data.activePersonnel,
          departmentBreakdown: data.departmentBreakdown,
          roleDistribution: data.roleDistribution,
          averageTenure: data.averageTenure,
          onboardingStats: {
            totalOnboarding: data.totalPersonnel - data.activePersonnel,
            averageProgress: 65, // Mock data - would come from real calculations
            completedThisMonth: 2 // Mock data
          },
          performanceMetrics: {
            averageProductivity: 78, // Mock data
            tasksCompletedThisMonth: 45, // Mock data
            projectsActive: 8, // Mock data
            hoursLoggedThisMonth: 320 // Mock data
          },
          trends: {
            personnelGrowth: [
              { month: 'Jan', count: 1 },
              { month: 'Feb', count: 2 },
              { month: 'Mar', count: 3 }
            ],
            productivityTrend: [
              { month: 'Jan', score: 75 },
              { month: 'Feb', score: 78 },
              { month: 'Mar', score: 82 }
            ]
          }
        };
        
        setAnalytics(enhancedAnalytics);
        setError(null);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Loading Analytics</h3>
            <p className="text-slate-400">Calculating personnel insights...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
          <div className="flex items-center gap-3 text-red-400">
            <AlertCircle className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Error Loading Analytics</h3>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Analytics Data</h3>
          <p className="text-slate-400">Unable to load analytics at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Personnel Analytics</h1>
          <p className="text-slate-400">Comprehensive insights into your organization's personnel</p>
        </div>
        <div className="text-sm text-slate-400">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Personnel"
          value={analytics.totalPersonnel}
          icon={Users}
          color="bg-blue-600"
          trend={{ value: 12, isPositive: true }}
          description="All active and onboarding personnel"
        />
        <MetricCard
          title="Active Personnel"
          value={analytics.activePersonnel}
          icon={CheckSquare}
          color="bg-green-600"
          trend={{ value: 8, isPositive: true }}
          description="Fully onboarded and active"
        />
        <MetricCard
          title="Average Tenure"
          value={Math.round(analytics.averageTenure)}
          unit="days"
          icon={Calendar}
          color="bg-purple-600"
          description="Average time with organization"
        />
        <MetricCard
          title="Productivity Score"
          value={`${Math.round(analytics.performanceMetrics.averageProductivity)}%`}
          icon={Target}
          color="bg-orange-600"
          trend={{ value: 5, isPositive: true }}
          description="Overall team productivity"
        />
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Department Distribution" icon={PieChart}>
          <DepartmentChart data={analytics.departmentBreakdown} />
        </ChartCard>

        <ChartCard title="Role Distribution" icon={BarChart3}>
          <RoleDistributionChart data={analytics.roleDistribution} />
        </ChartCard>

        <ChartCard title="Onboarding Progress" icon={Activity}>
          <OnboardingProgress stats={analytics.onboardingStats} />
        </ChartCard>

        <ChartCard title="Performance Overview" icon={Award}>
          <PerformanceOverview metrics={analytics.performanceMetrics} />
        </ChartCard>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800/30 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Growth Trends
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Personnel Growth</span>
              <span className="text-green-400">+12% this quarter</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Productivity Trend</span>
              <span className="text-green-400">+5% this month</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Retention Rate</span>
              <span className="text-green-400">95%</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/30 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Time Tracking
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Hours This Month</span>
              <span className="text-white">{analytics.performanceMetrics.hoursLoggedThisMonth}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Avg. Hours/Person</span>
              <span className="text-white">{Math.round(analytics.performanceMetrics.hoursLoggedThisMonth / analytics.activePersonnel)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Utilization Rate</span>
              <span className="text-white">85%</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/30 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            Achievements
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Tasks Completed</span>
              <span className="text-white">{analytics.performanceMetrics.tasksCompletedThisMonth}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Projects Delivered</span>
              <span className="text-white">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Team Satisfaction</span>
              <span className="text-white">4.2/5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 