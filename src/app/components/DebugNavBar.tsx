import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, FileJson, Code, Menu, X, Zap } from 'lucide-react';
import EndpointModal from './EndpointModal';
import ApiTester from './ApiTester';

interface ApiEndpoint {
  path: string;
  method: string;
  summary: string;
  tag: string;
}

const endpoints: ApiEndpoint[] = [
  { path: '/api/applicant/auth/request-access', method: 'POST', summary: 'Request magic link', tag: 'Authentication' },
  { path: '/api/applicant/auth/verify', method: 'GET', summary: 'Verify magic link token', tag: 'Authentication' },
  { path: '/api/applicant/auth/logout', method: 'POST', summary: 'Logout applicant', tag: 'Authentication' },
  { path: '/api/applicant/application', method: 'GET', summary: 'Get application data', tag: 'Application' },
  { path: '/api/applicant/application', method: 'PATCH', summary: 'Update application', tag: 'Application' },
  { path: '/api/applicant/communications', method: 'GET', summary: 'Get messages', tag: 'Communication' },
  { path: '/api/applicant/communications', method: 'POST', summary: 'Send message', tag: 'Communication' },
];

const groupedEndpoints = endpoints.reduce<Record<string, ApiEndpoint[]>>((acc, endpoint) => {
  if (!acc[endpoint.tag]) {
    acc[endpoint.tag] = [];
  }
  acc[endpoint.tag].push(endpoint);
  return acc;
}, {});

export const DebugNavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Authentication': true,
    'Application': false,
    'Communication': false,
  });
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTesterOpen, setIsTesterOpen] = useState(false);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-500';
      case 'POST': return 'bg-green-500';
      case 'PATCH': return 'bg-yellow-500';
      case 'PUT': return 'bg-orange-500';
      case 'DELETE': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleEndpointClick = (endpoint: ApiEndpoint) => {
    setSelectedEndpoint(endpoint);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleTestEndpoint = (endpoint: ApiEndpoint) => {
    setSelectedEndpoint(endpoint);
    setIsTesterOpen(true);
  };

  const closeTester = () => {
    setIsTesterOpen(false);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-indigo-600 text-white shadow-lg md:hidden"
        aria-label="Toggle API Debug Menu"
      >
        {isOpen ? <X size={24} /> : <Code size={24} />}
      </button>

      {/* Debug Nav Bar */}
      <div 
        className={`fixed top-0 right-0 z-40 h-full bg-gray-900 text-white transition-all duration-300 ease-in-out overflow-hidden
                   ${isOpen ? 'w-full md:w-80' : 'w-0 md:w-6'} shadow-xl flex flex-col`}
      >
        {/* Expand/Collapse tab for desktop */}
        <div 
          className="hidden md:flex items-center justify-center h-screen w-6 bg-indigo-700 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </div>

        <div className={`flex-1 overflow-hidden ${isOpen ? 'block' : 'hidden md:block'}`}>
          <div className="p-4 bg-indigo-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center">
              <FileJson className="mr-2" size={20} />
              API Debug
            </h2>
            <Link 
              href="/swagger" 
              target="_blank" 
              className="text-xs bg-indigo-600 px-2 py-1 rounded hover:bg-indigo-500 transition-colors"
            >
              Full Docs
            </Link>
          </div>

          <div className="overflow-y-auto h-[calc(100%-60px)]">
            {Object.entries(groupedEndpoints).map(([group, apis]) => (
              <div key={group} className="border-b border-gray-700">
                <div 
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-800"
                  onClick={() => toggleGroup(group)}
                >
                  <span className="font-medium">{group}</span>
                  {expandedGroups[group] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                
                {expandedGroups[group] && (
                  <div className="pl-4 pr-2 pb-2">
                    {apis.map((endpoint, index) => (
                      <div 
                        key={`${endpoint.path}-${endpoint.method}-${index}`}
                        className="my-2 p-2 bg-gray-800 rounded hover:bg-gray-700 group"
                      >
                        <div className="flex items-center">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${getMethodColor(endpoint.method)} mr-2`}>
                            {endpoint.method}
                          </span>
                          <span 
                            className="text-sm truncate cursor-pointer flex-1"
                            onClick={() => handleEndpointClick(endpoint)}
                          >
                            {endpoint.summary}
                          </span>
                          <button 
                            className="invisible group-hover:visible p-1 text-gray-400 hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTestEndpoint(endpoint);
                            }}
                            title="Test endpoint"
                          >
                            <Zap size={16} />
                          </button>
                        </div>
                        <div 
                          className="mt-1 text-xs text-gray-400 truncate cursor-pointer"
                          onClick={() => handleEndpointClick(endpoint)}
                        >
                          {endpoint.path}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Endpoint Modal */}
      <EndpointModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        endpoint={selectedEndpoint}
      />

      {/* API Tester Modal */}
      <ApiTester
        isOpen={isTesterOpen}
        onClose={closeTester}
        endpoint={selectedEndpoint}
      />
    </>
  );
};

// Custom ChevronLeft and ChevronRight components to avoid importing the entire Lucide library
const ChevronLeft = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ChevronRight = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

export default DebugNavBar; 