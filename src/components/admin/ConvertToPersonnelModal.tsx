'use client';

import { useState } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { ApplicationWithMetadata } from '@/lib/types';

interface ConvertToPersonnelModalProps {
  application: ApplicationWithMetadata;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ConvertToPersonnelModal = ({ 
  application, 
  isOpen, 
  onClose, 
  onSuccess 
}: ConvertToPersonnelModalProps) => {
  const [formData, setFormData] = useState({
    employeeId: `EMP${Date.now().toString().substring(6)}`,
    department: '',
    role: 'employee'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (!formData.employeeId.trim()) {
        throw new Error('Employee ID is required');
      }
      
      if (!formData.department.trim()) {
        throw new Error('Department is required');
      }
      
      const response = await fetch(`/api/admin/applications/${application._id}/convert-to-personnel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to convert application to personnel');
      }
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Convert to Personnel</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h4 className="text-white text-lg font-medium mb-2">Successfully Converted</h4>
            <p className="text-slate-300">
              {application.name} has been converted to personnel.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <p className="text-slate-300 mb-3">
                  This will create a personnel record for the approved application of <span className="text-white font-medium">{application.name}</span>.
                </p>
              </div>
              
              {error && (
                <div className="bg-red-900/20 border border-red-500/50 rounded p-3 text-red-300 text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label className="text-slate-300 text-sm mb-1 block">Employee ID*</label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"
                  required
                />
              </div>
              
              <div>
                <label className="text-slate-300 text-sm mb-1 block">Department*</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"
                  placeholder="e.g. Engineering, Design, Marketing"
                  required
                />
              </div>
              
              <div>
                <label className="text-slate-300 text-sm mb-1 block">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"
                >
                  <option value="employee">Employee</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                  <option value="manager">Manager</option>
                  <option value="director">Director</option>
                </select>
              </div>
              
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center space-x-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Convert to Personnel</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ConvertToPersonnelModal; 