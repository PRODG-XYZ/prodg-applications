import { useState, useMemo } from 'react';
import { useLinearProjects } from '../../../lib/hooks/useLinearProjects';
import { IProject } from '../../../lib/models/Project';
import { IProjectLinearMapping } from '../../../lib/models/ProjectLinearMapping';

interface ProjectManagementProps {
  projects: IProject[];
  departments: any[];
  onCreateProject: (projectData: any) => Promise<void>;
  onUpdateProject: (projectId: string, updates: any) => Promise<void>;
  onDeleteProject: (projectId: string) => Promise<void>;
}

interface ProjectCardProps {
  project: IProject;
  linearMapping?: IProjectLinearMapping;
  onEdit: () => void;
  onDelete: () => void;
  onViewDetails: () => void;
}

const ProjectCard = ({ project, linearMapping, onEdit, onDelete, onViewDetails }: ProjectCardProps) => {
  const getStatusColor = () => {
    switch (project.status) {
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = () => {
    switch (project.priority) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-blue-600';
      case 'low':
        return 'text-gray-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
          <p className="text-gray-600 text-sm mt-1">{project.description}</p>
        </div>
        {linearMapping && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            Linear Connected
          </span>
        )}
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor()}`}>
          {project.status}
        </span>
        <span className={`text-xs font-medium ${getPriorityColor()}`}>
          {project.priority} priority
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
        <div>
          <span className="font-medium">Start Date:</span>
          <br />
          {new Date(project.startDate).toLocaleDateString()}
        </div>
        <div>
          <span className="font-medium">End Date:</span>
          <br />
          {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}
        </div>
        <div>
          <span className="font-medium">Team Lead:</span>
          <br />
          {project.team.lead || 'Not assigned'}
        </div>
        <div>
          <span className="font-medium">Team Size:</span>
          <br />
          {project.team.members.length + 1} members
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={onViewDetails}
          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          View Details
        </button>
        <button
          onClick={onEdit}
          className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-2 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

const ProjectManagement = ({ 
  projects, 
  departments, 
  onCreateProject, 
  onUpdateProject, 
  onDeleteProject 
}: ProjectManagementProps) => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLinearFiltered, setIsLinearFiltered] = useState(false);

  // Filter projects based on filters
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesDepartment = selectedDepartment === 'all' || project.team.lead === selectedDepartment;
      const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
      const matchesSearch = !searchTerm || project.name.toLowerCase().includes(searchTerm.toLowerCase());
      // For Linear filter, we would need to check if project has Linear mapping
      const matchesLinear = !isLinearFiltered; // Placeholder - would check linearProjectId
      
      return matchesDepartment && matchesStatus && matchesSearch && matchesLinear;
    });
  }, [projects, selectedDepartment, selectedStatus, searchTerm, isLinearFiltered]);

  const projectStats = useMemo(() => {
    return {
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      planning: projects.filter(p => p.status === 'planning').length,
    };
  }, [projects]);

  const handleCreateProject = () => {
    // This would open a modal or navigate to a form
    console.log('Create new project');
  };

  const handleEditProject = (project: IProject) => {
    console.log('Edit project:', project._id);
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      onDeleteProject(projectId);
    }
  };

  const handleViewProjectDetails = (projectId: string) => {
    console.log('View project details:', projectId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Project Management</h2>
          <p className="text-gray-600 mt-1">Manage and track all company projects</p>
        </div>
        <button
          onClick={handleCreateProject}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{projectStats.total}</div>
          <div className="text-sm text-gray-600">Total Projects</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{projectStats.active}</div>
          <div className="text-sm text-gray-600">Active Projects</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{projectStats.planning}</div>
          <div className="text-sm text-gray-600">In Planning</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">{projectStats.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Linear Filter</label>
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="linear-filter"
                checked={isLinearFiltered}
                onChange={(e) => setIsLinearFiltered(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="linear-filter" className="text-sm text-gray-700">
                Linear Connected Only
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <ProjectCard
            key={project._id}
            project={project}
            onEdit={() => handleEditProject(project)}
            onDelete={() => handleDeleteProject(project._id)}
            onViewDetails={() => handleViewProjectDetails(project._id)}
          />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No projects found</div>
          <p className="text-gray-400 mt-2">Try adjusting your filters or create a new project</p>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement; 