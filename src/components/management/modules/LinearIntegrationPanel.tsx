import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLinearAuth } from '../../../lib/hooks/useLinearAuth';
import { useLinearTeams } from '../../../lib/hooks/useLinearTeams';
// import TeamMappingConfiguration from '../../linear/TeamMappingConfiguration'; // Commented out

interface TeamMapping {
  departmentId: string;
  linearTeamId: string;
  linearTeamName: string;
  syncEnabled: boolean;
}

const LinearIntegrationPanel = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'setup' /*| 'teams' | 'projects'*/ | 'settings'>('setup'); // Simplified tabs
  const [departments, setDepartments] = useState<any[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [teamMappings, setTeamMappings] = useState<TeamMapping[]>([]);

  // Linear auth config - memoized to prevent recreation on every render
  const linearAuthConfig = useMemo(() => ({
    clientId: process.env.NEXT_PUBLIC_LINEAR_CLIENT_ID || '',
    clientSecret: '', 
    redirectUri: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/linear/auth/callback`,
    scopes: ['read', 'write']
  }), []);

  const shouldEnableAuth = Boolean(linearAuthConfig.clientId);
  
  const {
    authUrl,
    isAuthenticated,
    isLoading: authLoading,
    error: authError,
    workspace,
    connectToLinear,
    disconnectLinear,
    refetchAuthStatus
  } = useLinearAuth({ 
    config: linearAuthConfig,
    enabled: shouldEnableAuth
  });

  const {
    teams,
    loading: teamsLoading,
    error: teamsError,
    refetch: refetchTeams
  } = useLinearTeams({ 
    enabled: false // Never auto-fetch
  });

  // Manual data loading function
  const loadData = useCallback(async () => {
    if (!shouldEnableAuth) return;
    
    try {
      // Load departments
      const deptResponse = await fetch('/api/departments');
      if (deptResponse.ok) {
        const deptData = await deptResponse.json();
        setDepartments(deptData);
      }
      
      // Load teams if authenticated
      if (isAuthenticated) {
        await refetchTeams();
      }
      
      // Load existing team mappings
      try {
        const mappingResponse = await fetch('/api/linear/team-mappings');
        if (mappingResponse.ok) {
          const mappingData = await mappingResponse.json();
          setTeamMappings(mappingData.mappings || []);
        }
      } catch (error) {
        console.log('No existing team mappings found');
      }
      
      setDataLoaded(true);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, [shouldEnableAuth, isAuthenticated, refetchTeams]);

  // Auto-load data when authenticated and on setup tab
  const [autoLoadTriggered, setAutoLoadTriggered] = useState(false);
  
  // Effect to auto-load teams when authenticated and ready
  useEffect(() => {
    console.log('Auto-load effect check:', {
      shouldEnableAuth,
      isAuthenticated,
      authLoading,
      autoLoadTriggered,
      dataLoaded
    });
    
    if (shouldEnableAuth && isAuthenticated && !authLoading && !autoLoadTriggered && !dataLoaded) {
      console.log('Auto-loading Linear data...');
      setAutoLoadTriggered(true);
      
      // Load data directly without using the callback
      (async () => {
        try {
          // Load departments
          const deptResponse = await fetch('/api/departments');
          if (deptResponse.ok) {
            const deptData = await deptResponse.json();
            setDepartments(deptData);
          }
          
          // Load teams if authenticated
          if (isAuthenticated) {
            await refetchTeams();
          }
          
          // Load existing team mappings
          try {
            const mappingResponse = await fetch('/api/linear/team-mappings');
            if (mappingResponse.ok) {
              const mappingData = await mappingResponse.json();
              setTeamMappings(mappingData.mappings || []);
            }
          } catch (error) {
            console.log('No existing team mappings found');
          }
          
          setDataLoaded(true);
        } catch (error) {
          console.error('Error loading data:', error);
        }
      })();
    }
  }, [shouldEnableAuth, isAuthenticated, authLoading, autoLoadTriggered, dataLoaded, refetchTeams]);

  // Handle team mapping save (Commented out as TeamMappingConfiguration is commented out)
  /*
  const handleSaveTeamMappings = async (mappings: TeamMapping[]) => {
    try {
      const response = await fetch('/api/linear/team-mappings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mappings }),
      });

      if (!response.ok) {
        throw new Error('Failed to save team mappings');
      }

      const result = await response.json();
      setTeamMappings(mappings);
      console.log('Team mappings saved successfully:', result);
    } catch (error) {
      console.error('Error saving team mappings:', error);
      throw error;
    }
  };
  */

  // Check for OAuth callback on mount (only once)
  const [callbackProcessed, setCallbackProcessed] = useState(false);
  
  useEffect(() => {
    const linearConnected = searchParams.get('linear_connected');
    const linearError = searchParams.get('linear_error');
    
    // Only process if we haven't already processed these params
    if (!callbackProcessed && (linearConnected === 'true' || linearError)) {
      setCallbackProcessed(true);
      
      if (linearConnected === 'true') {
        setShowSuccessMessage(true);
        router.replace('/management-dashboard', { scroll: false });
        refetchAuthStatus().then(() => {
          // Reset data loading states to trigger reload after successful auth
          setDataLoaded(false);
          setAutoLoadTriggered(false);
        });
        setTimeout(() => setShowSuccessMessage(false), 5000);
      } else if (linearError) {
        setShowErrorMessage(`Authentication failed: ${linearError}`);
        router.replace('/management-dashboard', { scroll: false });
        setTimeout(() => setShowErrorMessage(null), 10000);
      }
    }
  }, [searchParams, router, refetchAuthStatus, callbackProcessed]);

  const handleConnect = () => {
    if (!linearAuthConfig.clientId) {
      setShowErrorMessage('Linear Client ID not configured. Please check your environment variables.');
      return;
    }
    connectToLinear();
  };

  const handleDisconnect = async () => {
    try {
      await disconnectLinear();
      setShowSuccessMessage(false);
      setShowErrorMessage(null);
      setDataLoaded(false);
      setAutoLoadTriggered(false);
      setDepartments([]);
      setTeamMappings([]);
      // Clear teams from the hook's cache as well
      if (teams.length > 0) {
        // Force a refresh of the teams state by calling refetch with a reset
        refetchTeams();
      }
    } catch (error) {
      setShowErrorMessage('Failed to disconnect from Linear');
    }
  };

  const handleTabChange = (tab: 'setup' /*| 'teams' | 'projects'*/ | 'settings') => {
    setActiveTab(tab);
    
    // Load data when switching to teams tab if not loaded and authenticated (Commented out)
    /*
    if (tab === 'teams' && !dataLoaded && isAuthenticated && !authLoading) {
      loadData();
    }
    */
  };

  if (!shouldEnableAuth) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Linear Integration</h2>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="font-medium text-amber-800">Configuration Required</h3>
          </div>
          <p className="text-amber-700 text-sm mb-3">
            Linear OAuth is not configured. Please add the following environment variables:
          </p>
          <div className="bg-amber-100 rounded-md p-3">
            <code className="text-xs text-amber-800 block font-mono">
              LINEAR_CLIENT_ID=your_linear_client_id<br/>
              LINEAR_CLIENT_SECRET=your_linear_client_secret<br/>
              NEXT_PUBLIC_LINEAR_CLIENT_ID=your_linear_client_id<br/>
              NEXT_PUBLIC_BASE_URL=http://localhost:3000
            </code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Linear Integration</h2>
        </div>
        
        {isAuthenticated && (
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
          >
            Disconnect
          </button>
        )}
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h3 className="font-medium text-green-800">Successfully Connected!</h3>
          </div>
          <p className="text-green-700 text-sm">
            Your Linear workspace is now connected. You can start mapping teams and synchronizing projects.
          </p>
        </div>
      )}

      {/* Error Message */}
      {(showErrorMessage || authError) && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="font-medium text-red-800">Connection Error</h3>
          </div>
          <p className="text-red-700 text-sm">
            {showErrorMessage || authError?.message || 'Unknown error occurred'}
          </p>
        </div>
      )}

      {authLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-indigo-600 mb-3"></div>
          <p className="text-gray-600 text-sm">Checking Linear connection...</p>
        </div>
      ) : !isAuthenticated ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect to Linear</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Connect your Linear workspace to enable project and task synchronization.
          </p>
          <button
            onClick={handleConnect}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Connect Linear Workspace
          </button>
        </div>
      ) : (
        <div>
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'setup', name: 'Setup', icon: '⚙️' },
                // { id: 'teams', name: 'Team Mapping', icon: '👥' }, // Commented out
                // { id: 'projects', name: 'Projects', icon: '📋' }, // Commented out
                { id: 'settings', name: 'Settings', icon: '🔧' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as any)}
                  className={`${activeTab === tab.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'setup' && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <h3 className="font-medium text-green-800">Linear Connected</h3>
                </div>
                <p className="text-green-700 text-sm">
                  Your Linear workspace is successfully connected. 
                  {/* Basic functionality for connection status and data loading is retained. */}
                  {workspace && workspace.lastConnectedAt && (
                    <span className="block mt-1 text-green-600">
                      Connected: {new Date(workspace.lastConnectedAt).toLocaleString()}
                    </span>
                  )}
                </p>
              </div>
              
              {/* Load button if data not loaded */}
              {!dataLoaded && !teamsLoading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Load Integration Data</h4>
                      <p className="text-blue-700 text-sm">
                        Load teams and departments to see integration statistics (Team mapping UI is currently disabled).
                      </p>
                    </div>
                    <button
                      onClick={loadData}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Load Data
                    </button>
                  </div>
                </div>
              )}
              
              {/* Loading state */}
              {teamsLoading && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
                    <span className="text-gray-600 text-sm">Loading teams and data...</span>
                  </div>
                </div>
              )}
              
              {/* Data loaded - show stats */}
              {dataLoaded && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                      </svg>
                      <h4 className="font-medium text-gray-900">Available Teams (from Linear)</h4>
                    </div>
                    <p className="text-2xl font-bold text-indigo-600">
                      {teams.length}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {teams.length > 0 ? teams.map(t => t.name).join(', ') : 'No teams loaded or available'}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM12 15a1 1 0 102 0 1 1 0 00-2 0zm-6 0a1 1 0 102 0 1 1 0 00-2 0z"/>
                      </svg>
                      <h4 className="font-medium text-gray-900">Departments (PeopleOS)</h4>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {departments.length}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {departments.length > 0 ? 'Departments loaded' : 'No departments loaded'}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Error state */}
              {teamsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <h3 className="font-medium text-red-800">Error Loading Data</h3>
                  </div>
                  <p className="text-red-700 text-sm mb-3">{teamsError.message}</p>
                  <button
                    onClick={() => {
                      setDataLoaded(false);
                      setAutoLoadTriggered(false);
                      loadData();
                    }}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Feature Status</h4>
                <p className="text-blue-800 text-sm space-y-1">
                  Linear integration is connected. Team mapping and project sync features are currently under development and will be available soon.
                </p>
              </div>
            </div>
          )}

          {/* Commented out Team Mapping Tab Content */}
          {/* 
          {activeTab === 'teams' && (
            <div>
              {!dataLoaded ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zm-4 0a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Mapping</h3>
                  <p className="text-gray-600 mb-4">
                    Load Linear teams and departments to configure team mappings.
                  </p>
                  <button
                    onClick={loadData}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                  >
                    Load Team Data
                  </button>
                </div>
              ) : teamsLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-indigo-600 mb-3"></div>
                  <p className="text-gray-600 text-sm">Loading Linear teams...</p>
                </div>
              ) : teamsError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <h3 className="font-medium text-red-800">Error Loading Teams</h3>
                  </div>
                  <p className="text-red-700 text-sm mb-3">{teamsError.message}</p>
                  <button
                    onClick={() => {
                      setDataLoaded(false);
                      setAutoLoadTriggered(false);
                      loadData();
                    }}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <TeamMappingConfiguration
                  departments={departments}
                  linearTeams={teams}
                  existingMappings={teamMappings}
                  onSaveMapping={handleSaveTeamMappings}
                  loading={teamsLoading}
                />
              )}
            </div>
          )}
          */}

          {/* Commented out Projects Tab Content */}
          {/* 
          {activeTab === 'projects' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Management</h3>
              <p className="text-gray-600">
                Project management features are under development and will be available here soon.
              </p>
            </div>
          )}
          */}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Integration Settings</h3>
              <p className="text-gray-600">Settings for the Linear integration are under development.</p>
              {/* 
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="font-medium text-gray-900">Auto-sync</h4>
                    <p className="text-sm text-gray-600">Automatically sync changes between systems</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="font-medium text-gray-900">Sync Comments</h4>
                    <p className="text-sm text-gray-600">Include comments in synchronization</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="font-medium text-gray-900">Sync Attachments</h4>
                    <p className="text-sm text-gray-600">Include file attachments in sync</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
              */}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LinearIntegrationPanel; 