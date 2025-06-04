import React from 'react';
import { 
  UserPlus, 
  Download, 
  RefreshCcw, 
  BarChart, 
  Users, 
  Settings, 
  Bell, 
  ArrowRight 
} from 'lucide-react';

interface QuickActionsProps {
  onAddPersonnel: () => void;
  onExportData: () => void;
  onRefreshData: () => void;
  onViewAnalytics: () => void;
  pendingCount?: number;
}

const QuickActions = ({ 
  onAddPersonnel, 
  onExportData, 
  onRefreshData, 
  onViewAnalytics,
  pendingCount = 0
}: QuickActionsProps) => {
  return (
    <div className="bg-slate-800/30 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5" />
        Quick Actions
      </h3>
      
      <div className="space-y-3">
        <button 
          onClick={onAddPersonnel}
          className="w-full flex items-center gap-3 p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors text-left"
        >
          <UserPlus className="w-4 h-4 text-blue-400" />
          <div>
            <div className="text-white font-medium">Add New Personnel</div>
            <div className="text-slate-400 text-sm">Onboard a new team member</div>
          </div>
        </button>
        
        <button 
          onClick={onExportData}
          className="w-full flex items-center gap-3 p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors text-left"
        >
          <Download className="w-4 h-4 text-green-400" />
          <div>
            <div className="text-white font-medium">Export Data</div>
            <div className="text-slate-400 text-sm">Download personnel reports</div>
          </div>
        </button>
        
        <button 
          className="w-full flex items-center gap-3 p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors text-left"
          onClick={() => window.open('/admin/notifications', '_self')}
        >
          <Bell className="w-4 h-4 text-yellow-400" />
          <div>
            <div className="text-white font-medium">Notifications</div>
            <div className="text-slate-400 text-sm">
              {pendingCount > 0 
                ? `${pendingCount} pending ${pendingCount === 1 ? 'approval' : 'approvals'}`
                : 'No pending approvals'}
            </div>
          </div>
        </button>
        
        <button 
          onClick={onRefreshData}
          className="w-full flex items-center gap-3 p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors text-left"
        >
          <RefreshCcw className="w-4 h-4 text-purple-400" />
          <div>
            <div className="text-white font-medium">Refresh Data</div>
            <div className="text-slate-400 text-sm">Update from database</div>
          </div>
        </button>
        
        <button 
          onClick={onViewAnalytics}
          className="w-full flex items-center justify-between p-3 bg-blue-600/30 hover:bg-blue-600/40 rounded-lg transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <BarChart className="w-4 h-4 text-blue-400" />
            <div>
              <div className="text-white font-medium">View Analytics</div>
              <div className="text-blue-300/80 text-sm">Personnel performance metrics</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-blue-400" />
        </button>
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <div className="text-sm text-slate-400 mb-3">System Status</div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-400">Database</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-400 text-sm">Online</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Last Backup</span>
          <span className="text-slate-300 text-sm">
            {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuickActions; 