'use client';

import React, { useState, useEffect } from 'react';
import { load } from 'js-yaml';

interface ApiEndpoint {
  path: string;
  method: string;
  summary: string;
  description: string;
  tags: string[];
  responses: Record<string, any>;
  parameters?: any[];
  requestBody?: any;
}

export default function SwaggerPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [apiSpec, setApiSpec] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSwaggerYaml() {
      try {
        const response = await fetch('/api/swagger.yaml');
        if (!response.ok) {
          throw new Error('Failed to load Swagger documentation');
        }
        const content = await response.text();
        
        // Parse YAML content
        const parsedYaml = load(content);
        setApiSpec(parsedYaml);
      } catch (error) {
        console.error('Error fetching Swagger YAML:', error);
        setError('Failed to load API documentation');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSwaggerYaml();
  }, []);

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'bg-blue-500';
      case 'POST': return 'bg-green-500';
      case 'PATCH': return 'bg-yellow-500';
      case 'PUT': return 'bg-orange-500';
      case 'DELETE': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const toggleEndpoint = (endpointId: string) => {
    if (expandedEndpoint === endpointId) {
      setExpandedEndpoint(null);
    } else {
      setExpandedEndpoint(endpointId);
    }
  };

  const renderEndpoints = () => {
    if (!apiSpec || !apiSpec.paths) return null;

    // Group endpoints by tags
    const endpointsByTag: Record<string, ApiEndpoint[]> = {};
    
    Object.entries(apiSpec.paths).forEach(([path, methods]: [string, any]) => {
      Object.entries(methods).forEach(([method, details]: [string, any]) => {
        const tag = details.tags?.[0] || 'Other';
        
        if (!endpointsByTag[tag]) {
          endpointsByTag[tag] = [];
        }
        
        endpointsByTag[tag].push({
          path,
          method: method.toUpperCase(),
          summary: details.summary || '',
          description: details.description || '',
          tags: details.tags || [],
          responses: details.responses || {},
          parameters: details.parameters,
          requestBody: details.requestBody,
        });
      });
    });

    return Object.entries(endpointsByTag).map(([tag, endpoints]) => (
      <div key={tag} className="mb-8">
        <h2 className="text-xl font-bold mb-4">{tag}</h2>
        <div className="space-y-4">
          {endpoints.map((endpoint, index) => {
            const endpointId = `${endpoint.method}-${endpoint.path}-${index}`;
            const isExpanded = expandedEndpoint === endpointId;
            
            return (
              <div key={endpointId} className="border border-gray-200 rounded-lg overflow-hidden">
                <div 
                  className="flex items-start p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleEndpoint(endpointId)}
                >
                  <div className={`${getMethodColor(endpoint.method)} text-white px-3 py-1 rounded font-mono text-sm mr-3`}>
                    {endpoint.method}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{endpoint.summary}</h3>
                    <p className="text-sm text-gray-500 font-mono">{endpoint.path}</p>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="border-t border-gray-200 p-4">
                    {endpoint.description && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold mb-2">Description</h4>
                        <p className="text-sm text-gray-700">{endpoint.description}</p>
                      </div>
                    )}
                    
                    {endpoint.parameters && endpoint.parameters.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold mb-2">Parameters</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {endpoint.parameters.map((param: any, i: number) => (
                                <tr key={i}>
                                  <td className="px-4 py-2 text-sm text-gray-900">{param.name}</td>
                                  <td className="px-4 py-2 text-sm text-gray-900">{param.in}</td>
                                  <td className="px-4 py-2 text-sm text-gray-900">
                                    {param.schema?.type || param.type || 'object'}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900">
                                    {param.required ? 'Yes' : 'No'}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900">{param.description || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    
                    {endpoint.requestBody && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold mb-2">Request Body</h4>
                        <div className="bg-gray-100 p-3 rounded">
                          <pre className="text-sm overflow-x-auto">
                            {JSON.stringify(endpoint.requestBody, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Responses</h4>
                      {Object.entries(endpoint.responses).map(([code, response]: [string, any]) => (
                        <div key={code} className="mb-2">
                          <div className="flex items-center mb-1">
                            <span className={`inline-block w-16 text-center py-1 text-xs font-semibold rounded ${
                              code.startsWith('2') ? 'bg-green-100 text-green-800' : 
                              code.startsWith('4') ? 'bg-red-100 text-red-800' : 
                              code.startsWith('5') ? 'bg-orange-100 text-orange-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {code}
                            </span>
                            <span className="ml-2 text-sm text-gray-600">{response.description}</span>
                          </div>
                          {response.content && (
                            <div className="ml-16 bg-gray-100 p-3 rounded">
                              <pre className="text-sm overflow-x-auto">
                                {JSON.stringify(response.content, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Applicant Dashboard API Documentation</h1>
      <p className="text-gray-600 mb-6">API documentation for the applicant dashboard system</p>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <div>
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Server</h2>
            <div className="bg-gray-100 p-4 rounded">
              <p className="font-mono">{apiSpec?.servers?.[0]?.url || '/api'}</p>
              <p className="text-sm text-gray-600 mt-1">{apiSpec?.servers?.[0]?.description || 'API server'}</p>
            </div>
          </div>
          
          {renderEndpoints()}
        </div>
      )}
    </div>
  );
} 