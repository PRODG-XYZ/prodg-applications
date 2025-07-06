import { useState, useEffect } from 'react';
import { LinearTeam } from '../../../../lib/linear/client';
import { ILinearTeam } from '../../../../lib/models/LinearTeam';

interface TeamMapping {
  departmentId: string;
  linearTeamId: string;
}

interface TeamMappingProps {
  departments: {
    _id: string;
    name: string;
    description: string;
  }[];
  linearTeams: LinearTeam[];
  existingMappings: ILinearTeam[];
  onSaveMapping: (mappings: TeamMapping[]) => Promise<void>;
}

interface TeamMappingCardProps {
  department: {
    _id: string;
    name: string;
    description: string;
  };
  availableTeams: LinearTeam[];
  currentMapping?: ILinearTeam;
  onUpdateMapping: (linearTeamId: string | null) => void;
}

const TeamMappingCard = ({
  department,
  availableTeams,
  currentMapping,
  onUpdateMapping,
}: TeamMappingCardProps) => {
  return (
    <div className="p-4 border border-gray-200 rounded-lg mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">{department.name}</h3>
        {currentMapping && (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
            Mapped
          </span>
        )}
      </div>
      {department.description && (
        <p className="text-gray-600 text-sm mb-4">{department.description}</p>
      )}
      <div className="flex items-center">
        <label className="mr-2 font-medium">Linear Team:</label>
        <select
          className="flex-1 p-2 border border-gray-300 rounded"
          value={currentMapping?.linearId || ''}
          onChange={(e) => onUpdateMapping(e.target.value || null)}
        >
          <option value="">Select a Linear team</option>
          {availableTeams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name} ({team.key})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

const TeamMappingConfiguration = ({
  departments,
  linearTeams,
  existingMappings,
  onSaveMapping,
}: TeamMappingProps) => {
  const [mappings, setMappings] = useState<TeamMapping[]>([]);
  const [isMappingValid, setIsMappingValid] = useState(false);

  useEffect(() => {
    // Initialize mappings from existing data
    const initialMappings = departments.map((dept) => {
      const existingMapping = existingMappings.find((mapping) =>
        mapping.members.some((member) => member.personnelId === dept._id)
      );
      
      return {
        departmentId: dept._id,
        linearTeamId: existingMapping?.linearId || '',
      };
    });
    
    setMappings(initialMappings);
  }, [departments, existingMappings]);

  useEffect(() => {
    // Check if at least one mapping is set
    const hasMapping = mappings.some((mapping) => mapping.linearTeamId);
    setIsMappingValid(hasMapping);
  }, [mappings]);

  const handleUpdateMapping = (departmentId: string, linearTeamId: string | null) => {
    setMappings((prevMappings) =>
      prevMappings.map((mapping) =>
        mapping.departmentId === departmentId
          ? { ...mapping, linearTeamId: linearTeamId || '' }
          : mapping
      )
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Map Linear Teams to Departments</h2>
      
      <p className="text-gray-600">
        Associate your Linear teams with PeopleOS departments to enable seamless project and task synchronization.
      </p>
      
      {departments.map((dept) => (
        <TeamMappingCard
          key={dept._id}
          department={dept}
          availableTeams={linearTeams}
          currentMapping={existingMappings.find((m) =>
            m.members.some((member) => member.personnelId === dept._id)
          )}
          onUpdateMapping={(linearTeamId) => handleUpdateMapping(dept._id, linearTeamId)}
        />
      ))}
      
      <div className="flex justify-end">
        <button
          className={`px-4 py-2 rounded-lg ${
            isMappingValid
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          onClick={() => isMappingValid && onSaveMapping(mappings.filter(m => m.linearTeamId))}
          disabled={!isMappingValid}
        >
          Save Team Configuration
        </button>
      </div>
    </div>
  );
};

export default TeamMappingConfiguration; 