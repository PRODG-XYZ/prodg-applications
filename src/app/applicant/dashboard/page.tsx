'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Clock, 
  FileText, 
  MessageSquare, 
  User, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader,
  Send,
  Edit
} from 'lucide-react';
import { format } from 'date-fns';
import PersonnelOnboarding from '@/components/applicant/PersonnelOnboarding';

/**
 * Applicant Dashboard Page
 * Main dashboard showing application status, timeline, and quick actions
 */

interface Application {
  _id: string;
  name: string;
  email: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  createdAt: string;
  lastLoginAt?: string;
  estimatedDecisionDate?: string;
  reviewNotes?: string;
  communicationEnabled: boolean;
}

interface ProgressStage {
  status: string;
  label: string;
  description: string;
  completedAt: string | null;
  estimatedDuration: string;
  isCompleted: boolean;
  isActive: boolean;
  isPending: boolean;
}

interface ApplicationProgress {
  currentStatus: string;
  currentStageIndex: number;
  stages: ProgressStage[];
  estimatedDecisionDate?: string;
  reviewNotes?: string;
}

interface MessageSummary {
  totalCount: number;
  unreadCount: number;
  hasMessages: boolean;
  lastMessage?: {
    id: string;
    senderType: string;
    preview: string;
    timestamp: string;
    isRead: boolean;
  };
}

interface Activity {
  type: string;
  message: string;
  timestamp: string;
  icon: string;
}

interface DashboardStats {
  totalMessages: number;
  unreadMessages: number;
  lastActivity: string;
  daysSinceSubmission: number;
}

interface DashboardData {
  application: Application;
  progress: ApplicationProgress;
  messages: MessageSummary;
  recentActivity: Activity[];
  stats: DashboardStats;
}

interface PersonnelData {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  employeeId: string;
}

interface PersonnelStatus {
  isPersonnel: boolean;
  personnel: PersonnelData | null;
}

export default function ApplicantDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [personnelStatus, setPersonnelStatus] = useState<PersonnelStatus | null>(null);
  const [personnelLoading, setPersonnelLoading] = useState(true);
  const router = useRouter();

  // Debug function to manually check the personnel status
  const debugPersonnelStatus = async () => {
    if (!data || data.application.status !== 'approved') return;
    
    try {
      console.log('Debug personnel status data:', personnelStatus);
      const debugResponse = await fetch('/api/debug/applicant-status');
      const debugData = await debugResponse.json();
      console.log('Debug data:', debugData);
      
      // Also check with the direct record check endpoint
      const recordCheckResponse = await fetch('/api/debug/personnel-record-check');
      const recordCheckData = await recordCheckResponse.json();
      console.log('Direct record check:', recordCheckData);
      
      return {
        debugData,
        recordCheckData
      };
    } catch (err) {
      console.error('Debug check failed:', err);
      return null;
    }
  };

  // Fetch dashboard data from the new comprehensive API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/applicant/dashboard');
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/applicant/auth/request-access');
            return;
          }
          throw new Error('Failed to fetch dashboard data');
        }

        const dashboardData = await response.json();
        setData(dashboardData);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  // Check if the applicant has been converted to personnel
  useEffect(() => {
    const checkPersonnelStatus = async () => {
      try {
        console.log('Checking personnel status for approved applicant...');
        const response = await fetch('/api/applicant/personnel-status');
        
        if (!response.ok) {
          console.error('Failed to check personnel status:', response.status);
          return;
        }

        const statusData = await response.json();
        console.log('Personnel status data:', statusData);
        setPersonnelStatus(statusData);
      } catch (error) {
        console.error('Personnel status check error:', error);
      } finally {
        setPersonnelLoading(false);
      }
    };

    if (data?.application.status === 'approved') {
      console.log('Applicant is approved, checking personnel status');
      checkPersonnelStatus();
    } else {
      console.log('Applicant is not approved, status:', data?.application.status);
      setPersonnelLoading(false);
    }
  }, [data]);
  
  // Run debug check after personnel status is loaded
  useEffect(() => {
    if (data?.application.status === 'approved' && !personnelLoading) {
      debugPersonnelStatus();
    }
  }, [data, personnelLoading, personnelStatus]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  if (!data) {
    return <ErrorScreen error="No data available" />;
  }

  // Determine if we should show the personnel onboarding component
  // Use more explicit checks to handle edge cases
  const isApproved = data.application.status === 'approved';
  const hasPersonnelData = 
    personnelStatus !== null && 
    personnelStatus.isPersonnel === true && 
    personnelStatus.personnel !== null;
  
  const showPersonnelOnboarding = isApproved && !personnelLoading && hasPersonnelData;
  
  console.log('Should show personnel onboarding?', {
    isApproved,
    isLoading: personnelLoading,
    personnelStatus: personnelStatus ? {
      isPersonnel: personnelStatus.isPersonnel,
      hasData: !!personnelStatus.personnel,
      personnelId: personnelStatus.personnel?._id
    } : null,
    hasPersonnelData,
    showOnboarding: showPersonnelOnboarding
  });

  // Function to manually trigger personnel conversion
  const handleFixPersonnelStatus = async () => {
    if (data.application.status !== 'approved') {
      alert('Your application is not yet approved.');
      return;
    }

    try {
      console.log('Attempting to fix personnel status for:', data.application.email);
      
      // First check if the personnel record already exists
      const recordCheckResponse = await fetch('/api/debug/personnel-record-check');
      const recordCheckData = await recordCheckResponse.json();
      console.log('Pre-conversion record check:', recordCheckData);
      
      if (recordCheckData.personnelExists) {
        console.log('Personnel record already exists according to direct check:', recordCheckData.personnelId);
        alert('A personnel record already exists. Refreshing page to show onboarding...');
        window.location.reload();
        return;
      }
      
      // Use the manual conversion debug endpoint
      const response = await fetch('/api/debug/convert-applicant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.application.email,
          employeeId: `EMP${Date.now().toString().slice(-6)}`,
          department: 'Engineering',
          role: 'employee'
        })
      });

      console.log('Convert response status:', response.status);
      const result = await response.json();
      console.log('Convert response result:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to convert to personnel');
      }

      alert('Personnel profile created successfully! Refreshing page...');
      
      // Force a refetch of the personnel status before reloading
      const statusResponse = await fetch('/api/applicant/personnel-status');
      const statusData = await statusResponse.json();
      console.log('New personnel status after conversion:', statusData);
      
      // Final verification
      const finalCheckResponse = await fetch('/api/debug/personnel-record-check');
      const finalCheckData = await finalCheckResponse.json();
      console.log('Final record check:', finalCheckData);
      
      // Wait a moment to ensure database updates are complete
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error fixing personnel status:', error);
      alert('Failed to fix personnel status: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // Function to check personnel record directly
  const handleCheckPersonnelRecord = async () => {
    try {
      const recordCheckResponse = await fetch('/api/debug/personnel-record-check');
      const recordCheckData = await recordCheckResponse.json();
      console.log('Direct personnel record check:', recordCheckData);
      
      if (recordCheckData.personnelExists) {
        alert(`Personnel record exists with ID: ${recordCheckData.personnelId}\nRefreshing page to show onboarding...`);
        window.location.reload();
      } else {
        alert('No personnel record found. Please use the "Fix Personnel Status" button.');
      }
    } catch (error) {
      console.error('Error checking personnel record:', error);
      alert('Failed to check personnel record: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div className="space-y-8">
      {/* Personnel Onboarding - Show when applicant is approved and has a personnel profile */}
      {showPersonnelOnboarding && (
        <PersonnelOnboarding personnel={personnelStatus!.personnel!} />
      )}

      {/* Fix Personnel Status Button - Only show for approved applicants without a personnel profile */}
      {isApproved && !personnelLoading && !showPersonnelOnboarding && (
        <div className="bg-yellow-500/20 backdrop-blur-lg rounded-2xl p-6 border border-yellow-500/30 mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-yellow-500/20 rounded-full p-2 mt-1">
              <AlertCircle className="h-8 w-8 text-yellow-400" />
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">
                Personnel Profile Not Found
              </h2>
              
              <p className="text-slate-300 mb-4">
                Your application has been approved, but you don't have a personnel profile yet.
                This could be due to a technical issue. Click the button below to fix this issue.
              </p>
              
              <div>
                <pre className="text-xs text-slate-400 mb-4 p-2 bg-slate-800/50 rounded overflow-auto">
                  Debug info: {JSON.stringify({
                    isApproved,
                    personnelLoading,
                    personnelStatus: personnelStatus || 'null',
                    hasPersonnelData
                  }, null, 2)}
                </pre>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleFixPersonnelStatus}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white py-2 px-4 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <span>Fix Personnel Status</span>
                </button>
                
                <button
                  onClick={handleCheckPersonnelRecord}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <span>Check Personnel Record</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Header with Stats */}
      <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {data.application.name}!
            </h1>
            <p className="text-slate-300">
              Here's your application status and recent updates.
            </p>
          </div>
          <div className="hidden md:block">
            <StatusBadge status={data.application.status} />
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-700/30 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Days Since Submission</p>
            <p className="text-white text-2xl font-bold">{data.stats.daysSinceSubmission}</p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Total Messages</p>
            <p className="text-white text-2xl font-bold">{data.stats.totalMessages}</p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Unread Messages</p>
            <p className="text-white text-2xl font-bold">{data.stats.unreadMessages}</p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Current Status</p>
            <p className="text-cyan-400 text-lg font-semibold capitalize">{data.progress.currentStatus}</p>
          </div>
        </div>
      </div>

      {/* Enhanced Status Timeline */}
      <EnhancedStatusTimeline progress={data.progress} />

      {/* Quick Actions & Overview Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Application Overview */}
          <ApplicationOverview application={data.application} />
          
          {/* Enhanced Recent Activity */}
          <EnhancedRecentActivity activities={data.recentActivity} />
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <QuickActions 
            application={data.application} 
            unreadMessages={data.messages.unreadCount}
            showPersonnelDashboard={showPersonnelOnboarding}
            personnelId={personnelStatus?.personnel?._id}
          />
          
          {/* Enhanced Message Preview */}
          <EnhancedMessagePreview messages={data.messages} />
        </div>
      </div>
    </div>
  );
}

/**
 * Enhanced Status Timeline Component with Real Progress Data
 */
function EnhancedStatusTimeline({ progress }: { progress: ApplicationProgress }) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return FileText;
      case 'reviewing': return Clock;
      case 'approved': return CheckCircle;
      case 'rejected': return AlertCircle;
      default: return FileText;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'reviewing': return 'text-blue-400 bg-blue-500/20';
      case 'approved': return 'text-green-400 bg-green-500/20';
      case 'rejected': return 'text-red-400 bg-red-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'reviewing': return 'Under Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Not Selected';
      default: return 'Unknown';
    }
  };

  const Icon = getStatusIcon(progress.currentStatus);

  return (
    <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
      <h2 className="text-2xl font-bold text-white mb-6">Application Status</h2>
      
      <div className="flex items-center space-x-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getStatusColor(progress.currentStatus)}`}>
          <Icon size={24} />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">
            {getStatusLabel(progress.currentStatus)}
          </h3>
          <p className="text-slate-400">
            Submitted on {format(new Date(), 'MMMM d, yyyy')}
          </p>
        </div>
      </div>

      {/* Estimated Decision Date */}
      {progress.estimatedDecisionDate && (
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center space-x-2 text-blue-400 mb-2">
            <Calendar size={16} />
            <span className="text-sm font-medium">Estimated Decision Date</span>
          </div>
          <p className="text-blue-300">
            {format(new Date(progress.estimatedDecisionDate), 'MMMM d, yyyy')}
          </p>
        </div>
      )}

      {/* Review Notes */}
      {progress.reviewNotes && (
        <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-center space-x-2 text-amber-400 mb-2">
            <AlertCircle size={16} />
            <span className="text-sm font-medium">Review Notes</span>
          </div>
          <p className="text-amber-300 text-sm">{progress.reviewNotes}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Status Badge Component
 */
function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    pending: { color: 'bg-yellow-500/20 text-yellow-400', label: 'Pending Review' },
    reviewing: { color: 'bg-blue-500/20 text-blue-400', label: 'Under Review' },
    approved: { color: 'bg-green-500/20 text-green-400', label: 'Approved' },
    rejected: { color: 'bg-red-500/20 text-red-400', label: 'Not Selected' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

/**
 * Application Overview Component
 */
function ApplicationOverview({ application }: { application: Application }) {
  return (
    <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
      <h3 className="text-xl font-bold text-white mb-4">Application Details</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-slate-400 mb-1">Application ID</p>
          <p className="text-white font-mono text-sm">{application._id}</p>
        </div>
        
        <div>
          <p className="text-sm text-slate-400 mb-1">Submitted On</p>
          <p className="text-white">{format(new Date(application.createdAt), 'MMMM d, yyyy')}</p>
        </div>
        
        <div>
          <p className="text-sm text-slate-400 mb-1">Email</p>
          <p className="text-white">{application.email}</p>
        </div>
        
        <div>
          <p className="text-sm text-slate-400 mb-1">Last Login</p>
          <p className="text-white">
            {application.lastLoginAt 
              ? format(new Date(application.lastLoginAt), 'MMMM d, yyyy')
              : 'First time'
            }
          </p>
        </div>
      </div>

      {/* Review Notes */}
      {application.reviewNotes && (
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h4 className="text-blue-400 font-medium mb-2">Notes from Review Team</h4>
          <p className="text-blue-300 text-sm">{application.reviewNotes}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Quick Actions Component
 */
function QuickActions({ application, unreadMessages, showPersonnelDashboard = false, personnelId }: { 
  application: Application; 
  unreadMessages: number;
  showPersonnelDashboard?: boolean;
  personnelId?: string;
}) {
  return (
    <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
      <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
      
      <div className="space-y-3">
        <a
          href="/applicant/application"
          className="flex items-center justify-between p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors group"
        >
          <div className="flex items-center space-x-3">
            <FileText className="text-slate-400 group-hover:text-white" size={20} />
            <span className="text-white">View Application</span>
          </div>
          <span className="text-slate-400">→</span>
        </a>

        <a
          href="/applicant/messages"
          className="flex items-center justify-between p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors group"
        >
          <div className="flex items-center space-x-3">
            <MessageSquare className="text-slate-400 group-hover:text-white" size={20} />
            <span className="text-white">Messages</span>
            {unreadMessages > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadMessages}
              </span>
            )}
          </div>
          <span className="text-slate-400">→</span>
        </a>

        {application.status === 'pending' && (
          <a
            href="/applicant/application/edit"
            className="flex items-center justify-between p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <User className="text-slate-400 group-hover:text-white" size={20} />
              <span className="text-white">Edit Application</span>
            </div>
            <span className="text-slate-400">→</span>
          </a>
        )}

        {showPersonnelDashboard && (
          <a
            href={`/applicant/personnel/${personnelId}`}
            className="flex items-center justify-between p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <User className="text-slate-400 group-hover:text-white" size={20} />
              <span className="text-white">Personnel Dashboard</span>
            </div>
            <span className="text-slate-400">→</span>
          </a>
        )}
      </div>
    </div>
  );
}

/**
 * Enhanced Message Preview Component
 */
function EnhancedMessagePreview({ messages }: { messages: MessageSummary }) {
  return (
    <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Messages</h3>
        {messages.unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {messages.unreadCount} new
          </span>
        )}
      </div>
      
      {messages.hasMessages ? (
        <div className="space-y-4">
          {messages.unreadCount > 0 && (
            <p className="text-slate-300 text-sm">
              You have {messages.unreadCount} unread message{messages.unreadCount !== 1 ? 's' : ''} from the recruitment team.
            </p>
          )}
          
          {/* Last Message Preview */}
          {messages.lastMessage && (
            <div className="bg-slate-700/30 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <MessageSquare size={14} className="text-slate-400" />
                <span className="text-sm text-slate-400">
                  {messages.lastMessage.senderType === 'applicant' ? 'You' : 'Recruitment Team'}
                </span>
                <span className="text-xs text-slate-500">
                  {format(new Date(messages.lastMessage.timestamp), 'MMM d')}
                </span>
              </div>
              <p className="text-slate-300 text-sm line-clamp-2">
                {messages.lastMessage.preview}
              </p>
            </div>
          )}

          <a
            href="/applicant/messages"
            className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full text-center"
          >
            View All Messages ({messages.totalCount})
          </a>
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageSquare className="mx-auto text-slate-600 mb-3" size={32} />
          <p className="text-slate-400 text-sm">No messages yet</p>
          <p className="text-slate-500 text-xs mt-1">
            Start a conversation with the recruitment team
          </p>
          <a
            href="/applicant/messages"
            className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors mt-3"
          >
            Send First Message
          </a>
        </div>
      )}
    </div>
  );
}

/**
 * Enhanced Recent Activity Component
 */
function EnhancedRecentActivity({ activities }: { activities: Activity[] }) {
  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case 'user': return User;
      case 'send': return Send;
      case 'message-square': return MessageSquare;
      case 'edit': return Edit;
      case 'file-text': return FileText;
      default: return FileText;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'message_received': return 'text-blue-400';
      case 'message_sent': return 'text-cyan-400';
      case 'application_updated': return 'text-amber-400';
      case 'application_submitted': return 'text-green-400';
      case 'login': return 'text-slate-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
      <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
      
      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = getActivityIcon(activity.icon);
            const colorClass = getActivityColor(activity.type);

            return (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-slate-700/50 ${colorClass}`}>
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300 text-sm leading-relaxed">{activity.message}</p>
                  <p className="text-slate-500 text-xs mt-1">
                    {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <Clock className="mx-auto text-slate-600 mb-3" size={32} />
          <p className="text-slate-400 text-sm">No recent activity</p>
        </div>
      )}
    </div>
  );
}

/**
 * Loading Screen Component
 */
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Loader className="animate-spin text-cyan-500 mx-auto mb-4" size={32} />
        <p className="text-slate-300">Loading your dashboard...</p>
      </div>
    </div>
  );
}

/**
 * Error Screen Component
 */
function ErrorScreen({ error }: { error: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <AlertCircle className="text-red-500 mx-auto mb-4" size={32} />
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
} 