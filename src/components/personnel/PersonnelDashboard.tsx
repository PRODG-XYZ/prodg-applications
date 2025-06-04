'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Calendar, 
  Clock, 
  Users, 
  CheckSquare, 
  TrendingUp,
  Activity,
  Bell,
  Settings,
  LogOut
} from 'lucide-react';
import { PerformanceMetrics } from '@/lib/personnel/dashboard';
import TaskBoard from '@/components/personnel/TaskBoard';
import TeamDirectory from '@/components/personnel/TeamDirectory';
import TimeTracker from '@/components/personnel/TimeTracker';
import ProfileEditor from '@/components/personnel/ProfileEditor';
import OnboardingWizard from '@/components/personnel/OnboardingWizard';
import ProjectBoard from '@/components/personnel/ProjectBoard';

interface PersonnelDashboardProps {
  personnel: any;
  projects: any[];
  tasks: any[];
  metrics: PerformanceMetrics;
  recentActivity: any[];
}

const PersonnelDashboard = ({ 
  personnel, 
  projects, 
  tasks, 
  metrics, 
  recentActivity 
}: PersonnelDashboardProps) => {
  const [activeView, setActiveView] = useState<'overview' | 'projects' | 'tasks' | 'team' | 'profile' | 'time-tracking' | 'onboarding'>('overview');
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const MetricCard = ({ title, value, unit, icon: Icon, color }: any) => (
    <motion.div
      variants={cardVariants}
      className="bg-slate-800/30 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-white">
          {value}
          {unit && <span className="text-sm text-slate-400 ml-1">{unit}</span>}
        </p>
        <p className="text-sm text-slate-400">{title}</p>
      </div>
    </motion.div>
  );

  const OverviewSection = () => (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-blue-500/30"
      >
        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome back, {personnel.name}! 👋
        </h1>
        <p className="text-slate-300">
          {personnel.role} • {personnel.department}
        </p>
        <div className="mt-4 flex items-center space-x-4 text-sm text-slate-400">
          <span>Employee ID: {personnel.employeeId}</span>
          <span>•</span>
          <span>Last active: {new Date(personnel.lastActiveAt).toLocaleDateString()}</span>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <MetricCard
          title="Tasks Completed"
          value={metrics.tasksCompleted}
          icon={CheckSquare}
          color="bg-green-600"
        />
        <MetricCard
          title="Hours Logged"
          value={Math.round(metrics.totalHoursLogged * 10) / 10}
          unit="hrs"
          icon={Clock}
          color="bg-blue-600"
        />
        <MetricCard
          title="Projects"
          value={metrics.projectsContributed}
          icon={Users}
          color="bg-purple-600"
        />
        <MetricCard
          title="Productivity Score"
          value={Math.round(metrics.productivityScore)}
          unit="%"
          icon={TrendingUp}
          color="bg-orange-600"
        />
      </motion.div>

      {/* Active Tasks & Projects */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Tasks */}
        <motion.div
          variants={cardVariants}
          className="bg-slate-800/30 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <CheckSquare className="w-5 h-5 mr-2" />
            Active Tasks ({tasks.length})
          </h3>
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task: any) => (
              <div
                key={task._id}
                className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{task.title}</p>
                  <p className="text-slate-400 text-xs mt-1">
                    {task.priority} priority • Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  task.status === 'in_progress' ? 'bg-blue-600/20 text-blue-400' :
                  task.status === 'review' ? 'bg-yellow-600/20 text-yellow-400' :
                  'bg-slate-600/20 text-slate-400'
                }`}>
                  {task.status.replace('_', ' ')}
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="text-slate-400 text-center py-4">No active tasks</p>
            )}
          </div>
        </motion.div>

        {/* Active Projects */}
        <motion.div
          variants={cardVariants}
          className="bg-slate-800/30 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Projects ({projects.length})
          </h3>
          <div className="space-y-3">
            {projects.slice(0, 5).map((project: any) => (
              <div
                key={project._id}
                className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{project.name}</p>
                  <p className="text-slate-400 text-xs mt-1">
                    {project.team.members.length + 1} members • {project.priority} priority
                  </p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  project.status === 'active' ? 'bg-green-600/20 text-green-400' :
                  project.status === 'planning' ? 'bg-blue-600/20 text-blue-400' :
                  'bg-slate-600/20 text-slate-400'
                }`}>
                  {project.status}
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <p className="text-slate-400 text-center py-4">No active projects</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        variants={cardVariants}
        className="bg-slate-800/30 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {recentActivity.slice(0, 8).map((activity: any, index: number) => (
            <div key={index} className="flex items-center space-x-3 p-2">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'task' ? 'bg-blue-400' :
                activity.type === 'time_entry' ? 'bg-green-400' :
                'bg-purple-400'
              }`} />
              <div className="flex-1">
                <p className="text-white text-sm">{activity.title}</p>
                <p className="text-slate-400 text-xs">
                  {new Date(activity.timestamp).toISOString().replace('T', ' ').substring(0, 16)}
                </p>
              </div>
            </div>
          ))}
          {recentActivity.length === 0 && (
            <p className="text-slate-400 text-center py-4">No recent activity</p>
          )}
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Personnel Dashboard</h1>
                <p className="text-sm text-slate-400">{personnel.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-slate-400" />
              </button>
              <button className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-slate-400" />
              </button>
              <button className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-red-400">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-slate-700/50">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-1 overflow-x-auto">
            {[
              { key: 'overview', label: 'Overview', icon: Activity },
              { key: 'projects', label: 'Projects', icon: Users },
              { key: 'tasks', label: 'Tasks', icon: CheckSquare },
              { key: 'time-tracking', label: 'Time', icon: Clock },
              { key: 'team', label: 'Team', icon: Users },
              { key: 'profile', label: 'Profile', icon: User },
              ...(personnel?.onboarding?.completionPercentage < 100 ? [{ key: 'onboarding', label: 'Onboarding', icon: Calendar }] : [])
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveView(key as any)}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeView === key
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{label}</span>
                {key === 'onboarding' && personnel?.onboarding?.completionPercentage < 100 && (
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {activeView === 'overview' && <OverviewSection />}
        {activeView === 'projects' && (
          <ProjectBoard 
            projects={projects} 
            personnelId={personnel._id} 
            onViewProjectDetails={(projectId) => {
              // Placeholder for navigating to project details view
              console.log('View project details:', projectId);
            }}
          />
        )}
        {activeView === 'tasks' && (
          <TaskBoard
            tasks={tasks}
            projects={projects}
            personnelId={personnel._id}
            onTaskUpdate={(taskId, updates) => {
              // Update task in the UI
              console.log('Update task:', taskId, updates);
            }}
            onTaskCreate={(taskData) => {
              // Create new task
              console.log('Create task:', taskData);
            }}
          />
        )}
        {activeView === 'team' && (
          <TeamDirectory
            currentPersonnelId={personnel._id}
            teamMembers={teamMembers}
            departments={['Engineering', 'Design', 'Marketing', 'Sales']}
            onContactMember={(memberId) => {
              console.log('Contact member:', memberId);
            }}
            onScheduleMeeting={(memberId) => {
              console.log('Schedule meeting with:', memberId);
            }}
          />
        )}
        {activeView === 'time-tracking' && (
          <TimeTracker
            personnelId={personnel._id}
            tasks={tasks}
            projects={projects}
            onTimeEntryCreate={(entry) => {
              console.log('New time entry:', entry);
            }}
            onTimeEntryUpdate={(entryId, updates) => {
              console.log('Update time entry:', entryId, updates);
            }}
          />
        )}
        {activeView === 'profile' && (
          <ProfileEditor
            personnel={personnel}
            onSave={(updates) => {
              console.log('Profile updated:', updates);
              setShowProfileEditor(false);
            }}
            onCancel={() => setShowProfileEditor(false)}
          />
        )}
        {activeView === 'onboarding' && (
          <OnboardingWizard
            personnel={personnel}
            onComplete={() => setActiveView('overview')}
            onUpdateProgress={(progress) => {
              console.log('Onboarding progress:', progress);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PersonnelDashboard; 