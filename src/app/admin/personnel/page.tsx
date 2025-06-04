'use client';

import { useState } from 'react';
import PersonnelManagement from '@/components/admin/PersonnelManagement';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import QuickActions from '@/components/admin/QuickActions';
import RecentActivity from '@/components/admin/RecentActivity';
import { usePersonnelManagement } from '@/lib/hooks/usePersonnelManagement';
import { AdminPermissions } from '@/lib/models/Admin';
import { 
  Users, 
  BarChart3, 
  RefreshCw
} from 'lucide-react';

// Mock permissions for demonstration - in a real app, this would come from authentication context
const mockPermissions: AdminPermissions = {
  canManagePersonnel: true,
  canCreateProjects: true,
  canViewAllProjects: true,
  canManageRoles: true,
  canViewAnalytics: true,
  canExportData: true,
  canManageOnboarding: true,
  canApproveTimeoff: true,
  canConductReviews: true
};

// Mock recent activities for demonstration
const mockActivities = [
  {
    id: '1',
    type: 'onboarding_completed' as const,
    message: 'John Doe completed onboarding',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    personnelId: '683fabc0df1f36e88159da9c',
    personnelName: 'John Doe'
  },
  {
    id: '2',
    type: 'status_change' as const,
    message: 'Jane Smith status changed to Active',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    personnelId: '683fabc0df1f36e88159da9b',
    personnelName: 'Jane Smith'
  },
  {
    id: '3',
    type: 'leave_request' as const,
    message: 'Mike Johnson requested time off',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    personnelId: '683fabc0df1f36e88159da9d',
    personnelName: 'Mike Johnson'
  },
  {
    id: '4',
    type: 'new_personnel' as const,
    message: 'New personnel Alex Rivera added',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    personnelId: '683fabc0df1f36e88159da9e',
    personnelName: 'Alex Rivera'
  },
  {
    id: '5',
    type: 'profile_update' as const,
    message: 'Sarah Chen updated their profile',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    personnelId: '683fabc0df1f36e88159da9f',
    personnelName: 'Sarah Chen'
  }
];

const TabButton = ({ 
  active, 
  onClick, 
  icon: Icon, 
  label, 
  count 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: any; 
  label: string; 
  count?: number;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
      active 
        ? 'bg-blue-600 text-white shadow-lg' 
        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
    {count !== undefined && (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
        active ? 'bg-blue-500' : 'bg-slate-600'
      }`}>
        {count}
      </span>
    )}
  </button>
);

const PersonnelPage = () => {
  const [activeTab, setActiveTab] = useState<'management' | 'analytics'>('management');
  const { personnel, departments, loading, fetchPersonnel } = usePersonnelManagement();

  const handleTabChange = (tab: 'management' | 'analytics') => {
    setActiveTab(tab);
  };

  const personnelStats = {
    total: personnel.length,
    active: personnel.filter(p => p.status === 'active').length,
    onboarding: personnel.filter(p => p.status === 'onboarding').length,
    departments: departments.length
  };

  const handleAddPersonnel = () => {
    // This would be implemented in the PersonnelManagement component
    // We could use a global state or context to trigger the modal
    document.getElementById('add-personnel-button')?.click();
  };

  const handleExportData = async () => {
    const personnelIds = personnel.map(p => p._id).join(',');
    window.open(`/api/admin/personnel/export?ids=${personnelIds}`, '_blank');
  };

  const handleRefreshData = async () => {
    await fetchPersonnel();
  };

  const handleViewAnalytics = () => {
    setActiveTab('analytics');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Personnel Management</h1>
              <p className="text-slate-400 text-lg">
                Manage your organization's personnel, track performance, and analyze workforce data
              </p>
              <div className="flex items-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-slate-300">{personnelStats.active} Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-slate-300">{personnelStats.onboarding} Onboarding</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-slate-300">{personnelStats.departments} Departments</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{personnelStats.total}</div>
              <div className="text-slate-400">Total Personnel</div>
              <div className="text-sm text-green-400 mt-1">+12% this quarter</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <TabButton
                active={activeTab === 'management'}
                onClick={() => handleTabChange('management')}
                icon={Users}
                label="Personnel Management"
                count={personnelStats.total}
              />
              <TabButton
                active={activeTab === 'analytics'}
                onClick={() => handleTabChange('analytics')}
                icon={BarChart3}
                label="Analytics & Insights"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-400">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
              <button 
                className="p-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors"
                onClick={handleRefreshData}
              >
                <RefreshCw className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {activeTab === 'management' && (
              <div className="space-y-6">
                <PersonnelManagement permissions={mockPermissions} />
              </div>
            )}
            
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <AnalyticsDashboard />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <QuickActions 
              onAddPersonnel={handleAddPersonnel}
              onExportData={handleExportData}
              onRefreshData={handleRefreshData}
              onViewAnalytics={handleViewAnalytics}
              pendingCount={3}
            />
            
            <RecentActivity activities={mockActivities} />

            {/* System Status */}
            <div className="bg-slate-800/30 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">MongoDB</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-400 text-sm">Connected</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">API</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-400 text-sm">Operational</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Storage</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-yellow-400 text-sm">78% Used</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonnelPage; 