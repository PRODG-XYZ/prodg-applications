'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Search,
  Filter,
  Users,
  CheckCircle,
  AlertTriangle,
  Clock,
  Calendar,
  User,
  BarChart,
  List,
  Grid,
  MoreHorizontal,
  Star,
  Eye
} from 'lucide-react';

interface ProjectBoardProps {
  projects: any[];
  personnelId: string; // To potentially highlight projects the user is part of
  onViewProjectDetails?: (projectId: string) => void;
}

type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';
type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';
type ViewMode = 'grid' | 'list';

const statusConfig = {
  planning: { title: 'Planning', color: 'bg-blue-500', icon: <Clock className="w-3 h-3" /> },
  active: { title: 'Active', color: 'bg-green-500', icon: <CheckCircle className="w-3 h-3" /> },
  on_hold: { title: 'On Hold', color: 'bg-yellow-500', icon: <AlertTriangle className="w-3 h-3" /> },
  completed: { title: 'Completed', color: 'bg-purple-500', icon: <Star className="w-3 h-3" /> },
  archived: { title: 'Archived', color: 'bg-slate-500', icon: <Briefcase className="w-3 h-3" /> },
};

const priorityConfig = {
  low: { title: 'Low', color: 'text-slate-400' },
  medium: { title: 'Medium', color: 'text-blue-400' },
  high: { title: 'High', color: 'text-orange-400' },
  critical: { title: 'Critical', color: 'text-red-400' },
};

const ProjectCard = ({ project, personnelId, onViewProjectDetails }: { project: any, personnelId: string, onViewProjectDetails?: (projectId: string) => void }) => {
  const status = statusConfig[project.status as ProjectStatus] || statusConfig.active;
  const priority = priorityConfig[project.priority as ProjectPriority] || priorityConfig.medium;
  const isMember = project.team?.members?.includes(personnelId) || project.team?.lead === personnelId;
  const progress = project.progress || 0; // Assuming progress is a number between 0 and 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-slate-800/30 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg leading-tight">{project.name}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <div className={`flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-medium text-white ${status.color}`}>
              {status.icon}
              <span>{status.title}</span>
            </div>
            <div className={`px-2 py-0.5 rounded text-xs font-medium ${priority.color}`}>
              {priority.title} Priority
            </div>
          </div>
        </div>
        <button 
          onClick={() => onViewProjectDetails?.(project._id)}
          className="text-slate-400 hover:text-white transition-colors p-1"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-slate-300 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>
      )}

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      {/* Key Info */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
        <div className="flex items-center space-x-2 text-slate-400">
          <Calendar className="w-4 h-4" />
          <span>Start: {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-400">
          <Calendar className="w-4 h-4" />
          <span>Due: {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'N/A'}</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-400">
          <User className="w-4 h-4" />
          <span>Lead: {project.team?.leadName || 'N/A'}</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-400">
          <Users className="w-4 h-4" />
          <span>Members: {project.team?.members?.length || 0}</span>
        </div>
      </div>

      {/* Tags/Client */}
      <div className="flex items-center justify-between text-xs">
        {project.client && (
            <span className="text-slate-400">Client: {project.client.name}</span>
        )}
        {isMember && (
            <span className="px-2 py-1 bg-green-600/20 text-green-300 rounded">You're a member</span>
        )}
      </div>
      
      <button
        onClick={() => onViewProjectDetails?.(project._id)}
        className="mt-4 w-full py-2 px-4 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg transition-colors text-sm font-medium"
      >
        View Details
      </button>
    </motion.div>
  );
};

const ProjectListItem = ({ project, personnelId, onViewProjectDetails }: { project: any, personnelId: string, onViewProjectDetails?: (projectId: string) => void }) => {
  const status = statusConfig[project.status as ProjectStatus] || statusConfig.active;
  const priority = priorityConfig[project.priority as ProjectPriority] || priorityConfig.medium;
  const progress = project.progress || 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-slate-800/30 backdrop-blur-lg rounded-lg p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
             <Briefcase className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-medium">{project.name}</h3>
            <p className="text-slate-400 text-sm truncate max-w-xs">{project.description}</p>
          </div>
        </div>

        <div className="w-28 text-center">
            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium text-white ${status.color}`}>
                {status.icon}
                <span>{status.title}</span>
            </div>
        </div>

        <div className="w-28 text-center">
            <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${priority.color}`}>
                {priority.title} Priority
            </div>
        </div>
        
        <div className="w-32">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
        </div>

        <div className="w-36 text-sm text-slate-400 text-center">
          Due: {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'N/A'}
        </div>

        <div className="w-32 flex items-center justify-center space-x-2">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-300">{project.team?.members?.length || 0} members</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewProjectDetails?.(project._id)}
            className="p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}


const ProjectBoard = ({ projects, personnelId, onViewProjectDetails }: ProjectBoardProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<ProjectPriority | ''>('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = project.name.toLowerCase().includes(searchLower);
      const descriptionMatch = project.description?.toLowerCase().includes(searchLower) || false;
      const clientMatch = project.client?.name?.toLowerCase().includes(searchLower) || false;
      const statusMatch = statusFilter ? project.status === statusFilter : true;
      const priorityMatch = priorityFilter ? project.priority === priorityFilter : true;
      
      return (nameMatch || descriptionMatch || clientMatch) && statusMatch && priorityMatch;
    });
  }, [projects, searchTerm, statusFilter, priorityFilter]);

  const projectStats = useMemo(() => {
    return {
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      planning: projects.filter(p => p.status === 'planning').length,
    };
  }, [projects]);

  return (
    <div className="space-y-6">
      {/* Header and View Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Briefcase className="w-6 h-6 mr-3" />
            Projects Overview
          </h2>
          <p className="text-slate-400 mt-1">
            Manage and track all company projects.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            title="Grid View"
            className={`p-2 rounded transition-colors ${
              viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            title="List View"
            className={`p-2 rounded transition-colors ${
              viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Projects" value={projectStats.total} icon={Briefcase} color="bg-blue-600" />
        <StatCard title="Active Projects" value={projectStats.active} icon={CheckCircle} color="bg-green-600" />
        <StatCard title="In Planning" value={projectStats.planning} icon={Clock} color="bg-yellow-600" />
        <StatCard title="Completed" value={projectStats.completed} icon={Star} color="bg-purple-600" />
      </div>

      {/* Search and Filters */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | '')}
          className="px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          {Object.entries(statusConfig).map(([key, conf]) => (
            <option key={key} value={key}>{conf.title}</option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as ProjectPriority | '')}
          className="px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Priorities</option>
          {Object.entries(priorityConfig).map(([key, conf]) => (
            <option key={key} value={key}>{conf.title}</option>
          ))}
        </select>
      </div>

      {/* Project Display Area */}
      <div>
        {filteredProjects.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProjectCard project={project} personnelId={personnelId} onViewProjectDetails={onViewProjectDetails} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* List Header (Optional) */}
              <div className="hidden lg:flex items-center justify-between px-4 py-2 text-slate-400 text-xs font-medium border-b border-slate-700/50">
                  <span className="flex-1">Project Name</span>
                  <span className="w-28 text-center">Status</span>
                  <span className="w-28 text-center">Priority</span>
                  <span className="w-32 text-center">Progress</span>
                  <span className="w-36 text-center">Due Date</span>
                  <span className="w-32 text-center">Team Size</span>
                  <span className="w-16 text-center">Actions</span>
              </div>
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <ProjectListItem project={project} personnelId={personnelId} onViewProjectDetails={onViewProjectDetails} />
                </motion.div>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No projects found</h3>
            <p className="text-slate-400">
              {searchTerm || statusFilter || priorityFilter
                ? 'Try adjusting your search or filters.'
                : 'There are no projects to display currently.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: {title: string, value: string | number, icon: any, color: string}) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-800/30 backdrop-blur-lg rounded-xl p-5 border border-slate-700/50"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-slate-400">{title}</p>
      </div>
    </motion.div>
  );

export default ProjectBoard;
// Add Eye icon to lucide imports if needed for ProjectListItem view button
// import { Eye } from 'lucide-react'; 