import React from 'react';
import { Bell, CheckCircle, Calendar, User, Clock, UserPlus, FileEdit } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'onboarding_completed' | 'status_change' | 'new_personnel' | 'profile_update' | 'leave_request';
  message: string;
  timestamp: Date;
  personnelId?: string;
  personnelName?: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

const ActivityIcon = ({ type }: { type: ActivityItem['type'] }) => {
  const iconMap = {
    onboarding_completed: { icon: CheckCircle, color: 'text-green-500' },
    status_change: { icon: User, color: 'text-blue-500' },
    new_personnel: { icon: UserPlus, color: 'text-purple-500' },
    profile_update: { icon: FileEdit, color: 'text-yellow-500' },
    leave_request: { icon: Calendar, color: 'text-red-500' }
  };

  const config = iconMap[type] || { icon: Clock, color: 'text-slate-500' };
  const Icon = config.icon;

  return <Icon className={`w-4 h-4 ${config.color}`} />;
};

const formatTime = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

const RecentActivity = ({ activities }: RecentActivityProps) => {
  // Show the most recent 5 activities
  const recentActivities = activities.slice(0, 5);

  return (
    <div className="bg-slate-800/30 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Bell className="w-5 h-5" />
        Recent Activity
      </h3>

      {recentActivities.length > 0 ? (
        <div className="space-y-4">
          {recentActivities.map(activity => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center mt-1">
                <ActivityIcon type={activity.type} />
              </div>
              <div>
                <div className="text-white text-sm">{activity.message}</div>
                <div className="text-slate-400 text-xs">{formatTime(activity.timestamp)}</div>
                {activity.personnelName && (
                  <a 
                    href={`/personnel/dashboard?personnelId=${activity.personnelId}`}
                    className="text-blue-400 text-xs hover:underline block mt-1"
                  >
                    View {activity.personnelName}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-slate-400">
          <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>No recent activity</p>
        </div>
      )}
    </div>
  );
};

export default RecentActivity; 