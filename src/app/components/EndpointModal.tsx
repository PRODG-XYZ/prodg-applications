import React from 'react';
import { X, Copy } from 'lucide-react';

interface EndpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  endpoint: {
    path: string;
    method: string;
    summary: string;
    tag: string;
  } | null;
}

const EndpointModal: React.FC<EndpointModalProps> = ({ isOpen, onClose, endpoint }) => {
  if (!isOpen || !endpoint) return null;

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Mock endpoint details - in a real app, these would come from your Swagger data
  const mockRequestParams = {
    'POST /api/applicant/auth/request-access': {
      body: {
        email: 'user@example.com',
        applicationId: '6098dfdaa94286187cc6f123',
      },
    },
    'POST /api/applicant/auth/logout': {},
    'GET /api/applicant/auth/verify': {
      query: {
        token: 'abc123def456',
      },
    },
    'GET /api/applicant/application': {},
    'PATCH /api/applicant/application': {
      body: {
        feedbackMessage: 'Updated feedback',
        applicantNotifications: {
          email: true,
          statusUpdates: true,
        },
      },
    },
    'GET /api/applicant/communications': {
      query: {
        limit: 50,
        before: '2023-06-01T12:00:00Z',
      },
    },
    'POST /api/applicant/communications': {
      body: {
        message: 'Hello, I have a question about my application.',
      },
    },
  };

  const mockResponses = {
    'POST /api/applicant/auth/request-access': {
      success: true,
      message: 'Magic link sent successfully',
    },
    'POST /api/applicant/auth/logout': {
      success: true,
    },
    'GET /api/applicant/auth/verify': {
      success: true,
      redirectUrl: '/applicant',
    },
    'GET /api/applicant/application': {
      _id: '6098dfdaa94286187cc6f123',
      status: 'reviewing',
      lastLoginAt: '2023-06-01T10:30:00Z',
      communicationEnabled: true,
      estimatedDecisionDate: '2023-07-01T00:00:00Z',
      applicantNotifications: {
        email: true,
        statusUpdates: true,
        messages: true,
      },
    },
    'PATCH /api/applicant/application': {
      _id: '6098dfdaa94286187cc6f123',
      status: 'reviewing',
      feedbackMessage: 'Updated feedback',
      applicantNotifications: {
        email: true,
        statusUpdates: true,
        messages: true,
      },
    },
    'GET /api/applicant/communications': {
      messages: [
        {
          _id: '6098dfdaa94286187cc6f789',
          applicationId: '6098dfdaa94286187cc6f123',
          senderId: 'admin123',
          senderType: 'admin',
          message: 'Thank you for your application!',
          timestamp: '2023-06-01T09:00:00Z',
          isRead: true,
          messageType: 'message',
        },
      ],
      hasMore: false,
    },
    'POST /api/applicant/communications': {
      _id: '6098dfdaa94286187cc6f790',
      applicationId: '6098dfdaa94286187cc6f123',
      senderId: 'applicant123',
      senderType: 'applicant',
      message: 'Hello, I have a question about my application.',
      timestamp: '2023-06-02T10:15:00Z',
      isRead: false,
      messageType: 'message',
    },
  };

  const endpointKey = `${endpoint.method} ${endpoint.path}` as keyof typeof mockRequestParams;
  const requestParams = mockRequestParams[endpointKey] || {};
  const responseExample = mockResponses[endpointKey] || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center">
            <span className={`text-xs font-bold px-2 py-1 rounded ${getMethodColor(endpoint.method)} mr-2`}>
              {endpoint.method}
            </span>
            <h3 className="text-lg font-semibold text-white">{endpoint.summary}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-1">Endpoint</h4>
            <div className="flex items-center bg-gray-800 p-2 rounded">
              <span className="text-white font-mono text-sm flex-1">{endpoint.path}</span>
              <button 
                onClick={() => copyToClipboard(endpoint.path)}
                className="p-1 text-gray-400 hover:text-white"
                title="Copy to clipboard"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>

          {Object.keys(requestParams).length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-1">Request Parameters</h4>
              <div className="bg-gray-800 p-3 rounded">
                <pre className="text-white font-mono text-sm overflow-x-auto">
                  {JSON.stringify(requestParams, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-1">Response Example</h4>
            <div className="bg-gray-800 p-3 rounded">
              <pre className="text-white font-mono text-sm overflow-x-auto">
                {JSON.stringify(responseExample, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-700 flex justify-end">
          <button
            onClick={() => window.open('/swagger', '_blank')}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-500 transition-colors"
          >
            View Full Documentation
          </button>
        </div>
      </div>
    </div>
  );
};

export default EndpointModal; 