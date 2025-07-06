import { useState, useEffect } from 'react';
import { useLinearIssue, useCreateLinearIssue } from '../../lib/hooks/useLinearIssue';
import { ITaskLinearMapping } from '../../lib/models/TaskLinearMapping';

interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  description?: string;
  state: {
    id: string;
    name: string;
    color: string;
    type: string;
  };
  priority: {
    priority: number;
    label: string;
  };
  assignee?: {
    id: string;
    name: string;
    displayName: string;
    avatarUrl?: string;
  };
  url: string;
  createdAt: string;
  updatedAt: string;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignedTo?: string;
  dueDate?: string;
}

interface LinearIssueMapping {
  taskId: string;
  linearIssueId: string;
  linearIssueKey: string;
  syncStatus: 'synced' | 'pending_sync' | 'sync_failed';
  lastSyncedAt: Date;
  lastSyncError?: string;
}

interface LinearIssueWidgetProps {
  task: Task;
  linearMapping?: LinearIssueMapping;
  onCreateIssue?: (task: Task) => Promise<void>;
  onSyncIssue?: (taskId: string, issueId: string) => Promise<void>;
}

// Skeleton loader for the widget
const LinearIssueSkeleton = () => {
  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
        </div>
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
      </div>
      <div className="mt-2">
        <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-full bg-gray-200 rounded"></div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="h-4 w-12 bg-gray-200 rounded"></div>
        <div className="h-4 w-12 bg-gray-200 rounded"></div>
      </div>
      <div className="mt-3 h-8 w-full bg-gray-200 rounded"></div>
    </div>
  );
};

// Truncate text to specified length
const truncate = (text: string, maxLength: number) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Component to display Linear issue status
const LinearIssueStatus = ({ status }: { status: string }) => {
  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case 'backlog':
        return 'bg-gray-100 text-gray-800';
      case 'todo':
        return 'bg-blue-100 text-blue-800';
      case 'in progress':
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'done':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'canceled':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor()}`}>
      {status}
    </span>
  );
};

// Component to display Linear issue priority
const LinearIssuePriority = ({ priority }: { priority: number }) => {
  const getPriorityLabel = () => {
    switch (priority) {
      case 0:
        return 'No Priority';
      case 1:
        return 'Urgent';
      case 2:
        return 'High';
      case 3:
        return 'Medium';
      case 4:
        return 'Low';
      default:
        return 'Unknown';
    }
  };

  const getPriorityColor = () => {
    switch (priority) {
      case 1:
        return 'text-red-600';
      case 2:
        return 'text-orange-600';
      case 3:
        return 'text-blue-600';
      case 4:
        return 'text-gray-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <span className={`text-xs font-medium ${getPriorityColor()}`}>
      {getPriorityLabel()}
    </span>
  );
};

// Component to display Linear issue assignee
const LinearIssueAssignee = ({ assigneeId }: { assigneeId?: string }) => {
  return (
    <div className="flex items-center">
      {assigneeId ? (
        <>
          <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
          <span className="ml-2 text-xs text-gray-600">Assigned</span>
        </>
      ) : (
        <span className="text-xs text-gray-500">Unassigned</span>
      )}
    </div>
  );
};

// Linear logo component
const LinearLogo = ({ size = 16 }: { size?: number }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#5E6AD2" />
      <path d="M30 73.3333H70M30 53.3333H70M30 33.3333H70" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const LinearIssueWidget = ({ 
  task, 
  linearMapping, 
  onCreateIssue, 
  onSyncIssue 
}: LinearIssueWidgetProps) => {
  const [issue, setIssue] = useState<LinearIssue | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Linear issue details if mapping exists
  useEffect(() => {
    if (linearMapping && linearMapping.linearIssueId) {
      fetchIssueDetails(linearMapping.linearIssueId);
    }
  }, [linearMapping]);

  const fetchIssueDetails = async (issueId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/linear/issues/${issueId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch issue details');
      }
      
      const data = await response.json();
      setIssue(data.issue);
    } catch (err) {
      console.error('Error fetching issue details:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIssue = async () => {
    if (!onCreateIssue) return;
    
    try {
      setCreating(true);
      setError(null);
      await onCreateIssue(task);
    } catch (err) {
      console.error('Error creating Linear issue:', err);
      setError(err instanceof Error ? err.message : 'Failed to create issue');
    } finally {
      setCreating(false);
    }
  };

  const handleSyncIssue = async () => {
    if (!onSyncIssue || !linearMapping) return;
    
    try {
      setSyncing(true);
      setError(null);
      await onSyncIssue(task._id, linearMapping.linearIssueId);
      // Refresh issue details after sync
      await fetchIssueDetails(linearMapping.linearIssueId);
    } catch (err) {
      console.error('Error syncing issue:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync issue');
    } finally {
      setSyncing(false);
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'text-red-600 bg-red-100';
      case 2: return 'text-orange-600 bg-orange-100';
      case 3: return 'text-yellow-600 bg-yellow-100';
      case 4: return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStateColor = (color: string) => {
    return {
      backgroundColor: `${color}20`,
      borderColor: color,
      color: color
    };
  };

  if (loading) {
    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-4 h-4 bg-purple-500 rounded"></div>
          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!linearMapping) {
    return (
      <div className="p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 mb-3">Not linked to Linear</p>
          <button
            onClick={handleCreateIssue}
            disabled={creating}
            className="px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? (
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </span>
            ) : (
              'Create in Linear'
            )}
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium text-red-800">Error</span>
        </div>
        <p className="text-sm text-red-700 mb-3">{error}</p>
        <button
          onClick={() => linearMapping && fetchIssueDetails(linearMapping.linearIssueId)}
          className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-purple-500 rounded"></div>
          <span className="font-mono text-sm font-medium text-gray-900">
            {linearMapping.linearIssueKey}
          </span>
        </div>
        
        {issue && (
          <div 
            className="px-2 py-1 rounded text-xs font-medium border"
            style={getStateColor(issue.state.color)}
          >
            {issue.state.name}
          </div>
        )}
      </div>

      {issue && (
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-gray-900 text-sm leading-tight">
              {issue.title}
            </h4>
            {issue.description && (
              <p className="text-sm text-gray-600 mt-1">
                {truncate(issue.description, 100)}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {issue.priority && (
                <div className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(issue.priority.priority)}`}>
                  {issue.priority.label}
                </div>
              )}
              
              {issue.assignee && (
                <div className="flex items-center gap-1">
                  {issue.assignee.avatarUrl ? (
                    <img 
                      src={issue.assignee.avatarUrl} 
                      alt={issue.assignee.name}
                      className="w-5 h-5 rounded-full"
                    />
                  ) : (
                    <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {issue.assignee.displayName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="text-xs text-gray-600">
                    {issue.assignee.displayName}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {linearMapping.syncStatus === 'sync_failed' && (
                <div className="text-xs text-red-600 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Sync failed
                </div>
              )}
              
              {onSyncIssue && (
                <button
                  onClick={handleSyncIssue}
                  disabled={syncing}
                  className="text-xs text-purple-600 hover:text-purple-800 disabled:opacity-50"
                  title="Sync with Linear"
                >
                  {syncing ? (
                    <div className="w-3 h-3 border border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>

          {linearMapping.lastSyncedAt && (
            <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
              Last synced: {new Date(linearMapping.lastSyncedAt).toLocaleString()}
            </div>
          )}
        </div>
      )}

      <button 
        onClick={() => issue && window.open(issue.url, '_blank')}
        className="mt-3 w-full px-3 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
        disabled={!issue}
      >
        Open in Linear
      </button>
    </div>
  );
};

export default LinearIssueWidget; 