import { useState, useEffect } from 'react';
import { LinearTeam } from '../../lib/linear/client';

interface Department {
  _id: string;
  name: string;
  code: string;
  description: string;
  headOfDepartment: string;
  memberCount: number;
}

interface TeamMapping {
  departmentId: string;
  linearTeamId: string;
  linearTeamName: string;
  syncEnabled: boolean;
}

interface TeamMappingConfigurationProps {
  departments: Department[];
  linearTeams: LinearTeam[];
  existingMappings?: TeamMapping[];
  onSaveMapping: (mappings: TeamMapping[]) => Promise<void>;
  loading?: boolean;
}

const TeamMappingConfiguration = ({
  departments,
  linearTeams,
  existingMappings = [],
  onSaveMapping,
  loading = false
}: TeamMappingConfigurationProps) => {
  const [mappings, setMappings] = useState<TeamMapping[]>(existingMappings);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setMappings(existingMappings);
  }, [existingMappings]);

  const handleTeamMapping = (departmentId: string, linearTeamId: string, linearTeamName: string) => {
    setMappings(prev => {
      const existing = prev.find(m => m.departmentId === departmentId);
      if (existing) {
        return prev.map(m =>
          m.departmentId === departmentId
            ? { ...m, linearTeamId, linearTeamName }
            : m
        );
      } else {
        return [...prev, {
          departmentId,
          linearTeamId,
          linearTeamName,
          syncEnabled: true
        }];
      }
    });
  };

  const handleSyncToggle = (departmentId: string) => {
    setMappings(prev =>
      prev.map(m =>
        m.departmentId === departmentId
          ? { ...m, syncEnabled: !m.syncEnabled }
          : m
      )
    );
  };

  const handleRemoveMapping = (departmentId: string) => {
    setMappings(prev => prev.filter(m => m.departmentId !== departmentId));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSaveMapping(mappings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save team mappings:', error);
    } finally {
      setSaving(false);
    }
  };

  const getMappingForDepartment = (departmentId: string) => {
    return mappings.find(m => m.departmentId === departmentId);
  };

  const getAvailableTeams = (excludeDepartmentId?: string) => {
    const usedTeamIds = mappings
      .filter(m => m.departmentId !== excludeDepartmentId)
      .map(m => m.linearTeamId);
    return linearTeams.filter(team => !usedTeamIds.includes(team.id));
  };

  const isFormValid = mappings.length > 0 && mappings.every(m => m.linearTeamId && m.departmentId);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-indigo-600 mb-3"></div>
        <p className="text-gray-600 text-sm">Loading team data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Team Mapping Configuration</h2>
          <p className="text-sm text-gray-600 mt-1">
            Map Linear teams to PeopleOS departments for synchronized workflows and project management.
          </p>
        </div>
        
        {saveSuccess && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Saved successfully!</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{departments.length}</div>
          <div className="text-sm text-blue-800">Departments</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">{linearTeams.length}</div>
          <div className="text-sm text-purple-800">Linear Teams</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{mappings.length}</div>
          <div className="text-sm text-green-800">Mapped Teams</div>
        </div>
      </div>

      {/* Department Mapping Cards */}
      <div className="space-y-4">
        {departments.map(department => {
          const mapping = getMappingForDepartment(department._id);
          const availableTeams = getAvailableTeams(department._id);
          
          return (
            <div
              key={department._id}
              className={`border rounded-lg p-6 transition-all ${
                mapping?.syncEnabled
                  ? 'border-green-200 bg-green-50'
                  : mapping
                  ? 'border-gray-200 bg-gray-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">{department.name}</h3>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-mono rounded">
                      {department.code}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{department.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Head: {department.headOfDepartment} • {department.memberCount} members
                  </p>
                </div>
                
                {mapping && (
                  <div className="flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={mapping.syncEnabled}
                        onChange={() => handleSyncToggle(department._id)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                    <button
                      onClick={() => handleRemoveMapping(department._id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                      title="Remove mapping"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Linear Team Assignment
                  </label>
                  <select
                    value={mapping?.linearTeamId || ''}
                    onChange={(e) => {
                      const selectedTeam = linearTeams.find(t => t.id === e.target.value);
                      if (selectedTeam) {
                        handleTeamMapping(department._id, selectedTeam.id, selectedTeam.name);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a Linear team...</option>
                    {/* Show currently selected team even if not in available list */}
                    {mapping && !availableTeams.find(t => t.id === mapping.linearTeamId) && (
                      <option value={mapping.linearTeamId}>
                        {mapping.linearTeamName} (currently selected)
                      </option>
                    )}
                    {availableTeams.map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name} ({team.key})
                      </option>
                    ))}
                  </select>
                </div>

                {mapping && (
                  <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{mapping.linearTeamName}</p>
                        <p className="text-sm text-gray-500">
                          Sync: {mapping.syncEnabled ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      mapping.syncEnabled
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {mapping.syncEnabled ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {mappings.length > 0 && (
            <span>
              {mappings.filter(m => m.syncEnabled).length} of {mappings.length} mappings active
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={!isFormValid || saving}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            isFormValid && !saving
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </span>
          ) : (
            'Save Team Mappings'
          )}
        </button>
      </div>
    </div>
  );
};

export default TeamMappingConfiguration; 