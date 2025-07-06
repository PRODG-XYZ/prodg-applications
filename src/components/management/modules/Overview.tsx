'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { 
  Users, 
  FileText, 
  ClipboardCheck, 
  Clock, 
  Calendar,
  MessageSquare,
  Briefcase,
  Building2,
  AlertTriangle,
  TrendingUp,
  Activity,
  CheckCircle
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  className?: string;
}

function StatCard({ title, value, icon, trend, className }: StatCardProps) {
  return (
    <Card className={`bg-slate-800/50 border-slate-700/50 p-4 ${className}`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-slate-400 font-medium">{title}</h3>
        <div className="text-slate-300">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-white mb-2">{value}</div>
      {trend && (
        <div className="flex items-center text-sm">
          <span className={trend.positive ? 'text-green-400' : 'text-red-400'}>
            {trend.positive ? '↑' : '↓'} {trend.value}%
          </span>
          <span className="text-slate-400 ml-1">{trend.label}</span>
        </div>
      )}
    </Card>
  );
}

interface RecentActivityItem {
  id: string;
  type: 'application' | 'personnel' | 'system';
  action: string;
  subject: string;
  timestamp: Date;
  user?: string;
}

interface PendingTaskItem {
  id: string;
  title: string;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
  type: 'application' | 'personnel' | 'other';
}

export default function Overview() {
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    totalPersonnel: 0,
    activePersonnel: 0,
    totalDepartments: 0,
    averageResponseTime: '0d',
    messageCount: 0,
    upcomingInterviews: 0
  });
  
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [pendingTasks, setPendingTasks] = useState<PendingTaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOverviewData() {
      try {
        setLoading(true);
        
        // Fetch application stats
        const appStatsResponse = await fetch('/api/admin/applications/stats');
        const appStats = appStatsResponse.ok ? await appStatsResponse.json() : null;
        
        // Fetch personnel stats
        const personnelResponse = await fetch('/api/admin/analytics');
        const personnelStats = personnelResponse.ok ? await personnelResponse.json() : null;
        
        // Fetch recent applications for activity
        const recentAppsResponse = await fetch('/api/admin/applications?limit=5');
        const recentApps = recentAppsResponse.ok ? await recentAppsResponse.json() : null;
        
        // Update stats
        setStats({
          totalApplications: appStats?.stats?.total || 0,
          pendingApplications: appStats?.stats?.pending || 0,
          totalPersonnel: personnelStats?.totalPersonnel || 0,
          activePersonnel: personnelStats?.activePersonnel || 0,
          totalDepartments: personnelStats?.departmentBreakdown?.length || 0,
          averageResponseTime: appStats?.stats?.responseRate ? `${Math.round(appStats.stats.responseRate / 24)}d` : '0d',
          messageCount: appStats?.stats?.newToday || 0,
          upcomingInterviews: 0 // This would come from a calendar/scheduling API
        });
        
        // Transform recent applications into activity items
        if (recentApps?.applications) {
          const activities: RecentActivityItem[] = recentApps.applications.slice(0, 4).map((app: any) => ({
            id: app._id,
            type: 'application' as const,
            action: app.status === 'pending' ? 'submitted' : app.status,
            subject: `${app.position || 'Application'} from ${app.name}`,
            timestamp: new Date(app.createdAt),
            user: app.name
          }));
          setRecentActivity(activities);
        }
        
        // Generate pending tasks based on data
        const tasks: PendingTaskItem[] = [];
        
        if (appStats?.stats?.pending > 0) {
          tasks.push({
            id: '1',
            title: `Review ${appStats.stats.pending} pending applications`,
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
            priority: 'high',
            type: 'application'
          });
        }
        
        if (personnelStats?.totalPersonnel > personnelStats?.activePersonnel) {
          const onboarding = personnelStats.totalPersonnel - personnelStats.activePersonnel;
          tasks.push({
            id: '2',
            title: `Complete onboarding for ${onboarding} team members`,
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48),
            priority: 'medium',
            type: 'personnel'
          });
        }
        
        tasks.push({
          id: '3',
          title: 'Prepare monthly department report',
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 72),
          priority: 'high',
          type: 'other'
        });
        
        setPendingTasks(tasks);
      } catch (error) {
        console.error('Failed to fetch overview data', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchOverviewData();
  }, []);

  function formatTimeAgo(date: Date) {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffMins < 24 * 60) {
      return `${Math.floor(diffMins / 60)}h ago`;
    } else {
      return `${Math.floor(diffMins / (60 * 24))}d ago`;
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-slate-400';
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-600 border-t-slate-300 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading overview data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Applications" 
          value={stats.totalApplications}
          icon={<FileText className="h-5 w-5" />}
          trend={{ value: 12, label: 'vs last month', positive: true }}
        />
        <StatCard 
          title="Pending Applications" 
          value={stats.pendingApplications}
          icon={<ClipboardCheck className="h-5 w-5" />}
          trend={{ value: 5, label: 'vs last month', positive: false }}
        />
        <StatCard 
          title="Total Personnel" 
          value={stats.totalPersonnel}
          icon={<Users className="h-5 w-5" />}
          trend={{ value: 2, label: 'vs last month', positive: true }}
        />
        <StatCard 
          title="Active Personnel" 
          value={stats.activePersonnel}
          icon={<CheckCircle className="h-5 w-5" />}
        />
        <StatCard 
          title="Departments" 
          value={stats.totalDepartments}
          icon={<Building2 className="h-5 w-5" />}
        />
        <StatCard 
          title="Avg. Response Time" 
          value={stats.averageResponseTime}
          icon={<Clock className="h-5 w-5" />}
          trend={{ value: 8, label: 'faster', positive: true }}
        />
        <StatCard 
          title="New Messages" 
          value={stats.messageCount}
          icon={<MessageSquare className="h-5 w-5" />}
        />
        <StatCard 
          title="Upcoming Interviews" 
          value={stats.upcomingInterviews}
          icon={<Calendar className="h-5 w-5" />}
        />
      </div>
      
      {/* Activity and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="bg-slate-800/50 border-slate-700/50 p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map(activity => (
                <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-slate-700/50">
                  <div className={`mt-1 p-2 rounded-full 
                    ${activity.type === 'application' ? 'bg-blue-500/20' : 
                      activity.type === 'personnel' ? 'bg-green-500/20' : 
                      'bg-purple-500/20'}`}
                  >
                    {activity.type === 'application' ? 
                      <FileText className="h-4 w-4 text-blue-400" /> : 
                      activity.type === 'personnel' ? 
                      <Users className="h-4 w-4 text-green-400" /> :
                      <Clock className="h-4 w-4 text-purple-400" />
                    }
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-white font-medium">{activity.subject}</span>
                      <span className="text-slate-400 text-sm">{formatTimeAgo(activity.timestamp)}</span>
                    </div>
                    <div className="text-slate-400 text-sm">
                      {activity.user ? `${activity.user} ${activity.action}` : `System ${activity.action}`}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-center py-4">No recent activity</p>
            )}
          </div>
          <button className="mt-4 text-sm text-blue-400 hover:text-blue-300">
            View all activity →
          </button>
        </Card>
        
        {/* Pending Tasks */}
        <Card className="bg-slate-800/50 border-slate-700/50 p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Pending Tasks</h3>
          <div className="space-y-4">
            {pendingTasks.length > 0 ? (
              pendingTasks.map(task => (
                <div key={task.id} className="flex items-start gap-3 pb-3 border-b border-slate-700/50">
                  <div className="mt-1">
                    <AlertTriangle className={`h-5 w-5 ${getPriorityColor(task.priority)}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-white font-medium">{task.title}</span>
                      <span className={`${getPriorityColor(task.priority)} text-sm`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="text-slate-400 text-sm">
                      Due {task.dueDate.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-center py-4">No pending tasks</p>
            )}
          </div>
          <button className="mt-4 text-sm text-blue-400 hover:text-blue-300">
            View all tasks →
          </button>
        </Card>
      </div>
    </div>
  );
} 