'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function DebugPersonnelPage() {
  const [email, setEmail] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [convertFormData, setConvertFormData] = useState({
    email: '',
    employeeId: `EMP${Date.now().toString().substring(6)}`,
    department: 'Engineering',
    role: 'employee'
  });
  const [convertResult, setConvertResult] = useState<any>(null);
  const [convertLoading, setConvertLoading] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      const response = await fetch(`/api/debug/personnel-check?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check personnel status');
      }
      
      setResults(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleConvertFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConvertFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    setConvertLoading(true);
    setConvertError(null);
    setConvertResult(null);
    
    try {
      const response = await fetch('/api/debug/convert-applicant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(convertFormData)
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to convert applicant');
      }
      
      setConvertResult(data);
    } catch (error) {
      setConvertError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setConvertLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Personnel Debug Tools</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Check Personnel Status */}
          <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-4">Check Applicant Status</h2>
            <form onSubmit={handleCheck} className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm mb-1 block">Applicant Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"
                  placeholder="Enter applicant email"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center space-x-2 disabled:opacity-50"
                disabled={loading || !email}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Checking...</span>
                  </>
                ) : (
                  <span>Check Status</span>
                )}
              </button>
            </form>
            
            {error && (
              <div className="mt-4 bg-red-900/20 border border-red-500/50 rounded p-3 text-red-300 text-sm">
                {error}
              </div>
            )}
            
            {results && (
              <div className="mt-4 bg-slate-700/30 rounded-lg p-4 text-sm">
                <h3 className="text-white font-medium mb-2">Results</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-slate-400">Application ID:</span>
                    <span className="text-white ml-2">{results.application._id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Name:</span>
                    <span className="text-white ml-2">{results.application.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Status:</span>
                    <span className="text-white ml-2">{results.application.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Has Personnel Record:</span>
                    <span className={`ml-2 ${results.isPersonnel ? 'text-green-400' : 'text-red-400'}`}>
                      {results.isPersonnel ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {results.isPersonnel && (
                    <>
                      <div>
                        <span className="text-slate-400">Personnel ID:</span>
                        <span className="text-white ml-2">{results.personnel._id}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Employee ID:</span>
                        <span className="text-white ml-2">{results.personnel.employeeId}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Department:</span>
                        <span className="text-white ml-2">{results.personnel.department}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Role:</span>
                        <span className="text-white ml-2">{results.personnel.role}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Convert to Personnel */}
          <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-4">Convert to Personnel</h2>
            <form onSubmit={handleConvert} className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm mb-1 block">Applicant Email</label>
                <input
                  type="email"
                  name="email"
                  value={convertFormData.email}
                  onChange={handleConvertFormChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"
                  placeholder="Enter applicant email"
                  required
                />
              </div>
              
              <div>
                <label className="text-slate-300 text-sm mb-1 block">Employee ID</label>
                <input
                  type="text"
                  name="employeeId"
                  value={convertFormData.employeeId}
                  onChange={handleConvertFormChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"
                  required
                />
              </div>
              
              <div>
                <label className="text-slate-300 text-sm mb-1 block">Department</label>
                <input
                  type="text"
                  name="department"
                  value={convertFormData.department}
                  onChange={handleConvertFormChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"
                  required
                />
              </div>
              
              <div>
                <label className="text-slate-300 text-sm mb-1 block">Role</label>
                <select
                  name="role"
                  value={convertFormData.role}
                  onChange={handleConvertFormChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"
                >
                  <option value="employee">Employee</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                  <option value="manager">Manager</option>
                  <option value="director">Director</option>
                </select>
              </div>
              
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center space-x-2 disabled:opacity-50"
                disabled={convertLoading || !convertFormData.email || !convertFormData.employeeId || !convertFormData.department}
              >
                {convertLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Converting...</span>
                  </>
                ) : (
                  <span>Convert to Personnel</span>
                )}
              </button>
            </form>
            
            {convertError && (
              <div className="mt-4 bg-red-900/20 border border-red-500/50 rounded p-3 text-red-300 text-sm">
                {convertError}
              </div>
            )}
            
            {convertResult && (
              <div className="mt-4 bg-green-900/20 border border-green-500/50 rounded p-3 text-green-300 text-sm">
                {convertResult.message ? (
                  <p>{convertResult.message}</p>
                ) : (
                  <p>Successfully converted to personnel!</p>
                )}
                {convertResult.personnel && (
                  <div className="mt-2">
                    <p>Employee ID: {convertResult.personnel.employeeId}</p>
                    <p>Role: {convertResult.personnel.role}</p>
                    <p>Department: {convertResult.personnel.department}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 