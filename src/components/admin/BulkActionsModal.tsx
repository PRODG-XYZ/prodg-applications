import React, { useState } from 'react';
import { IPersonnel } from '@/lib/admin/personnel';
import { IDepartment } from '@/lib/models/Department';
import { 
  X, 
  Users, 
  Building, 
  UserCheck, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Settings
} from 'lucide-react';

interface BulkActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecute: (action: BulkAction) => Promise<void>;
  selectedPersonnel: IPersonnel[];
  departments: IDepartment[];
}

interface BulkAction {
  type: 'change_department' | 'change_role' | 'change_status' | 'assign_manager' | 'export_data';
  value?: string;
  data?: any;
}

const BulkActionsModal = ({ 
  isOpen, 
  onClose, 
  onExecute, 
  selectedPersonnel, 
  departments 
}: BulkActionsModalProps) => {
  const [selectedAction, setSelectedAction] = useState<BulkAction['type'] | ''>('');
  const [actionValue, setActionValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationStep, setConfirmationStep] = useState(false);

  const actionOptions = [
    {
      type: 'change_department' as const,
      label: 'Change Department',
      description: 'Move selected personnel to a different department',
      icon: Building,
      color: 'text-blue-400',
      requiresValue: true,
      valueType: 'select',
      options: departments.map(d => ({ value: d.name, label: d.name }))
    },
    {
      type: 'change_role' as const,
      label: 'Change Role',
      description: 'Update the role for selected personnel',
      icon: UserCheck,
      color: 'text-green-400',
      requiresValue: true,
      valueType: 'select',
      options: [
        { value: 'employee', label: 'Employee' },
        { value: 'senior', label: 'Senior' },
        { value: 'lead', label: 'Lead' },
        { value: 'manager', label: 'Manager' },
        { value: 'director', label: 'Director' }
      ]
    },
    {
      type: 'change_status' as const,
      label: 'Change Status',
      description: 'Update the status for selected personnel',
      icon: Settings,
      color: 'text-yellow-400',
      requiresValue: true,
      valueType: 'select',
      options: [
        { value: 'onboarding', label: 'Onboarding' },
        { value: 'active', label: 'Active' },
        { value: 'on_leave', label: 'On Leave' },
        { value: 'terminated', label: 'Terminated' }
      ]
    },
    {
      type: 'export_data' as const,
      label: 'Export Data',
      description: 'Export selected personnel data to CSV',
      icon: Users,
      color: 'text-purple-400',
      requiresValue: false
    }
  ];

  const selectedActionConfig = actionOptions.find(option => option.type === selectedAction);

  const handleExecute = async () => {
    if (!selectedAction) return;

    setLoading(true);
    try {
      const action: BulkAction = {
        type: selectedAction,
        value: actionValue || undefined,
        data: {
          personnelIds: selectedPersonnel.map(p => p._id),
          personnelCount: selectedPersonnel.length
        }
      };

      await onExecute(action);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error executing bulk action:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedAction('');
    setActionValue('');
    setConfirmationStep(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const canProceed = selectedAction && (!selectedActionConfig?.requiresValue || actionValue);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-6 h-6" />
            Bulk Actions
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Selected Personnel Summary */}
          <div className="bg-slate-700/30 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Selected Personnel</h3>
            <p className="text-slate-300 mb-3">
              {selectedPersonnel.length} personnel selected for bulk action
            </p>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {selectedPersonnel.map(person => (
                <span
                  key={person._id}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm"
                >
                  {person.name}
                  <span className="text-blue-400/70">({person.role})</span>
                </span>
              ))}
            </div>
          </div>

          {!confirmationStep ? (
            <>
              {/* Action Selection */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold text-white">Select Action</h3>
                <div className="grid grid-cols-1 gap-3">
                  {actionOptions.map(option => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.type}
                        onClick={() => setSelectedAction(option.type)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          selectedAction === option.type
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={`w-5 h-5 mt-1 ${option.color}`} />
                          <div>
                            <h4 className="font-medium text-white">{option.label}</h4>
                            <p className="text-sm text-slate-400">{option.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Value Selection */}
              {selectedActionConfig?.requiresValue && (
                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-semibold text-white">
                    Select {selectedActionConfig.label.split(' ')[1]}
                  </h3>
                  {selectedActionConfig.valueType === 'select' && (
                    <select
                      value={actionValue}
                      onChange={(e) => setActionValue(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select an option...</option>
                      {selectedActionConfig.options?.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setConfirmationStep(true)}
                  disabled={!canProceed}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Confirmation Step */}
              <div className="space-y-6">
                <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-yellow-400 mt-1" />
                    <div>
                      <h3 className="font-semibold text-yellow-400 mb-2">Confirm Bulk Action</h3>
                      <p className="text-yellow-300">
                        You are about to perform the following action on {selectedPersonnel.length} personnel:
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    {selectedActionConfig && (
                      <selectedActionConfig.icon className={`w-6 h-6 ${selectedActionConfig.color}`} />
                    )}
                    <h4 className="text-lg font-semibold text-white">
                      {selectedActionConfig?.label}
                    </h4>
                  </div>
                  
                  {selectedActionConfig?.requiresValue && (
                    <div className="mb-4">
                      <p className="text-slate-300">
                        <span className="font-medium">New Value:</span> {
                          selectedActionConfig.options?.find(opt => opt.value === actionValue)?.label || actionValue
                        }
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-slate-300 font-medium">Affected Personnel:</p>
                    <div className="max-h-32 overflow-y-auto">
                      {selectedPersonnel.map(person => (
                        <div key={person._id} className="flex items-center justify-between py-1">
                          <span className="text-slate-300">{person.name}</span>
                          <span className="text-slate-400 text-sm">
                            {person.department} • {person.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 mt-1" />
                    <div>
                      <h4 className="font-semibold text-red-400 mb-1">Warning</h4>
                      <p className="text-red-300 text-sm">
                        This action cannot be undone. Please ensure you have selected the correct personnel and action.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Confirmation Buttons */}
                <div className="flex items-center justify-end gap-4">
                  <button
                    onClick={() => setConfirmationStep(false)}
                    className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleExecute}
                    disabled={loading}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Execute Action
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkActionsModal; 