import React, { useState } from 'react';
import { Send, X, Check, Copy, Clipboard } from 'lucide-react';

interface ApiTesterProps {
  isOpen: boolean;
  onClose: () => void;
  endpoint: {
    path: string;
    method: string;
    summary: string;
    tag: string;
  } | null;
}

const ApiTester: React.FC<ApiTesterProps> = ({ isOpen, onClose, endpoint }) => {
  const [requestBody, setRequestBody] = useState('{}');
  const [queryParams, setQueryParams] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedResponse, setCopiedResponse] = useState(false);

  if (!isOpen || !endpoint) return null;

  const handleSendRequest = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      let url = endpoint.path;
      
      // Add query parameters if provided
      if (queryParams.trim() && endpoint.method === 'GET') {
        url = `${url}${url.includes('?') ? '&' : '?'}${queryParams}`;
      }

      const requestOptions: RequestInit = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      };

      // Add request body for non-GET requests
      if (endpoint.method !== 'GET' && requestBody.trim() !== '{}') {
        try {
          requestOptions.body = JSON.stringify(JSON.parse(requestBody));
        } catch (e) {
          setError('Invalid JSON in request body');
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch(url, requestOptions);
      
      // Try to parse as JSON
      try {
        const jsonResponse = await response.json();
        setResponse({
          status: response.status,
          statusText: response.statusText,
          body: jsonResponse,
          headers: Object.fromEntries(response.headers.entries()),
        });
      } catch (e) {
        // If not JSON, get text
        const textResponse = await response.text();
        setResponse({
          status: response.status,
          statusText: response.statusText,
          body: textResponse,
          headers: Object.fromEntries(response.headers.entries()),
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const copyResponseToClipboard = () => {
    if (!response) return;
    
    const responseText = JSON.stringify(response, null, 2);
    navigator.clipboard.writeText(responseText);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center">
            <span className={`text-xs font-bold px-2 py-1 rounded ${
              endpoint.method === 'GET' ? 'bg-blue-500' : 
              endpoint.method === 'POST' ? 'bg-green-500' : 
              endpoint.method === 'PATCH' ? 'bg-yellow-500' : 
              endpoint.method === 'PUT' ? 'bg-orange-500' : 
              endpoint.method === 'DELETE' ? 'bg-red-500' : 
              'bg-gray-500'
            } mr-2`}>
              {endpoint.method}
            </span>
            <h3 className="text-lg font-semibold text-white">Test {endpoint.summary}</h3>
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
            <div className="bg-gray-800 p-2 rounded">
              <span className="text-white font-mono text-sm">{endpoint.path}</span>
            </div>
          </div>

          {endpoint.method === 'GET' && (
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-1">Query Parameters</h4>
              <div className="bg-gray-800 p-2 rounded">
                <input
                  type="text"
                  value={queryParams}
                  onChange={(e) => setQueryParams(e.target.value)}
                  placeholder="e.g. param1=value1&param2=value2"
                  className="w-full bg-gray-800 text-white font-mono text-sm outline-none"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Format: param1=value1&param2=value2</p>
            </div>
          )}

          {endpoint.method !== 'GET' && (
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-1">Request Body</h4>
              <div className="bg-gray-800 p-2 rounded">
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  rows={5}
                  className="w-full bg-gray-800 text-white font-mono text-sm outline-none resize-y"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">JSON format required</p>
            </div>
          )}

          <div className="pt-4">
            <button
              onClick={handleSendRequest}
              disabled={isLoading}
              className={`px-4 py-2 rounded-md flex items-center justify-center w-full ${
                isLoading 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-500'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending Request...
                </>
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  Send Request
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-900/30 rounded p-3 text-red-300">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {response && (
            <div className="border border-gray-700 rounded overflow-hidden">
              <div className="bg-gray-800 p-3 flex justify-between items-center">
                <div className="flex items-center">
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded mr-2 ${
                    response.status >= 200 && response.status < 300 
                      ? 'bg-green-900/30 text-green-300' 
                      : response.status >= 400 
                      ? 'bg-red-900/30 text-red-300' 
                      : 'bg-yellow-900/30 text-yellow-300'
                  }`}>
                    {response.status}
                  </span>
                  <span className="text-sm text-gray-300">{response.statusText}</span>
                </div>
                <button
                  onClick={copyResponseToClipboard}
                  className="text-gray-400 hover:text-white p-1"
                  title="Copy response"
                >
                  {copiedResponse ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                </button>
              </div>
              <div className="bg-gray-900 p-3 max-h-60 overflow-auto">
                <pre className="text-white font-mono text-sm whitespace-pre-wrap">
                  {JSON.stringify(response.body, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiTester; 