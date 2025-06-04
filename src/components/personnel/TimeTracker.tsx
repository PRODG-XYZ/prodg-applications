'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  Square,
  Clock,
  Calendar,
  CheckSquare,
  BarChart3,
  Timer,
  Plus,
  Edit,
  Trash2,
  Coffee,
  Users,
  BookOpen
} from 'lucide-react';

interface TimeTrackerProps {
  personnelId: string;
  tasks: any[];
  projects: any[];
  onTimeEntryCreate?: (entry: any) => void;
  onTimeEntryUpdate?: (entryId: string, updates: any) => void;
}

interface TimeEntry {
  _id?: string;
  personnelId: string;
  projectId: string;
  taskId?: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  type: 'work' | 'meeting' | 'break' | 'training';
  isApproved: boolean;
}

interface TimerSession {
  taskId?: string;
  projectId?: string;
  description: string;
  startTime: Date;
  type: 'work' | 'meeting' | 'break' | 'training';
}

const TimeTracker = ({ personnelId, tasks, projects, onTimeEntryCreate, onTimeEntryUpdate }: TimeTrackerProps) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState<TimerSession | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [description, setDescription] = useState('');
  const [sessionType, setSessionType] = useState<TimeEntry['type']>('work');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [showTimeLog, setShowTimeLog] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isTracking && currentSession) {
      intervalRef.current = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - currentSession.startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTracking, currentSession]);

  useEffect(() => {
    // Load saved session from localStorage
    const savedSession = localStorage.getItem('timeTrackerSession');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        setCurrentSession({
          ...session,
          startTime: new Date(session.startTime)
        });
        setIsTracking(true);
        setSelectedTask(session.taskId || '');
        setSelectedProject(session.projectId || '');
        setDescription(session.description || '');
        setSessionType(session.type || 'work');
      } catch (error) {
        console.error('Failed to restore session:', error);
      }
    }

    // Load recent time entries
    fetchTimeEntries();
  }, []);

  const fetchTimeEntries = async () => {
    try {
      const response = await fetch(`/api/personnel/time-tracking?personnelId=${personnelId}&limit=10`);
      if (response.ok) {
        const result = await response.json();
        setTimeEntries(result.entries || []);
      }
    } catch (error) {
      console.error('Failed to fetch time entries:', error);
    }
  };

  const startTimer = () => {
    const now = new Date();
    const session: TimerSession = {
      taskId: selectedTask || undefined,
      projectId: selectedProject,
      description: description || 'Working on task',
      startTime: now,
      type: sessionType
    };

    setCurrentSession(session);
    setIsTracking(true);
    setElapsedTime(0);

    // Save to localStorage
    localStorage.setItem('timeTrackerSession', JSON.stringify(session));
  };

  const pauseTimer = () => {
    setIsTracking(false);
    localStorage.removeItem('timeTrackerSession');
  };

  const stopTimer = async () => {
    if (!currentSession) return;

    const now = new Date();
    const duration = Math.floor((now.getTime() - currentSession.startTime.getTime()) / 1000 / 60);

    const timeEntry: Partial<TimeEntry> = {
      personnelId,
      projectId: currentSession.projectId!,
      taskId: currentSession.taskId,
      description: currentSession.description,
      startTime: currentSession.startTime,
      endTime: now,
      duration,
      type: currentSession.type,
      isApproved: false
    };

    try {
      const response = await fetch('/api/personnel/time-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(timeEntry)
      });

      if (response.ok) {
        const result = await response.json();
        onTimeEntryCreate?.(result.entry);
        fetchTimeEntries();
      }
    } catch (error) {
      console.error('Failed to create time entry:', error);
    }

    // Reset state
    setIsTracking(false);
    setCurrentSession(null);
    setElapsedTime(0);
    setDescription('');
    localStorage.removeItem('timeTrackerSession');
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const quickStart = (type: TimeEntry['type'], defaultDescription: string) => {
    setSessionType(type);
    setDescription(defaultDescription);
    if (type === 'work' && !selectedProject) {
      // Auto-select first project if available
      if (projects.length > 0) {
        setSelectedProject(projects[0]._id);
      }
    }
    startTimer();
    setShowQuickActions(false);
  };

  const selectedTaskData = tasks.find(task => task._id === selectedTask);
  const selectedProjectData = projects.find(project => project._id === selectedProject);

  const typeIcons = {
    work: CheckSquare,
    meeting: Users,
    break: Coffee,
    training: BookOpen
  };

  const typeColors = {
    work: 'bg-blue-600',
    meeting: 'bg-purple-600',
    break: 'bg-orange-600',
    training: 'bg-green-600'
  };

  return (
    <div className="space-y-6">
      {/* Main Timer Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/30 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Timer className="w-5 h-5 mr-2" />
            Time Tracker
          </h3>
          <button
            onClick={() => setShowTimeLog(!showTimeLog)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
          </button>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-6">
          <div className="text-4xl font-mono font-bold text-white mb-2">
            {formatTime(elapsedTime)}
          </div>
          {currentSession && (
            <div className="text-slate-400 text-sm">
              Started at {currentSession.startTime.toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Current Task/Project Info */}
        {currentSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-slate-700/30 rounded-lg"
          >
            <div className="flex items-center space-x-2 mb-2">
              {(() => {
                const IconComponent = typeIcons[currentSession.type];
                return <IconComponent className="w-4 h-4 text-blue-400" />;
              })()}
              <span className="text-white font-medium capitalize">{currentSession.type}</span>
            </div>
            <p className="text-slate-300 text-sm mb-2">{currentSession.description}</p>
            {selectedTaskData && (
              <p className="text-slate-400 text-xs">Task: {selectedTaskData.title}</p>
            )}
            {selectedProjectData && (
              <p className="text-slate-400 text-xs">Project: {selectedProjectData.name}</p>
            )}
          </motion.div>
        )}

        {/* Controls */}
        {!isTracking ? (
          <div className="space-y-4">
            {/* Task Selection */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Project (Required)
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Task (Optional)
                </label>
                <select
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Task</option>
                  {tasks.filter(task => !selectedProject || task.projectId === selectedProject).map(task => (
                    <option key={task._id} value={task._id}>
                      {task.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What are you working on?"
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Session Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Type
              </label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(typeIcons).map(([type, IconComponent]) => (
                  <button
                    key={type}
                    onClick={() => setSessionType(type as TimeEntry['type'])}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-all ${
                      sessionType === type
                        ? `${typeColors[type as keyof typeof typeColors]} border-white/50 text-white`
                        : 'bg-slate-700/30 border-slate-600 text-slate-400 hover:text-white hover:border-slate-500'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-sm capitalize">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <div className="flex space-x-3">
              <button
                onClick={startTimer}
                disabled={!selectedProject}
                className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                <Play className="w-5 h-5" />
                <span>Start Timer</span>
              </button>

              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions */}
            {showQuickActions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-700"
              >
                <button
                  onClick={() => quickStart('work', 'Working on current task')}
                  className="flex items-center space-x-2 p-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg transition-colors"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Quick Work</span>
                </button>
                <button
                  onClick={() => quickStart('meeting', 'Team meeting')}
                  className="flex items-center space-x-2 p-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg transition-colors"
                >
                  <Users className="w-4 h-4" />
                  <span>Meeting</span>
                </button>
                <button
                  onClick={() => quickStart('break', 'Taking a break')}
                  className="flex items-center space-x-2 p-3 bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 rounded-lg transition-colors"
                >
                  <Coffee className="w-4 h-4" />
                  <span>Break</span>
                </button>
                <button
                  onClick={() => quickStart('training', 'Learning and development')}
                  className="flex items-center space-x-2 p-3 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded-lg transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Training</span>
                </button>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={pauseTimer}
              className="flex-1 flex items-center justify-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <Pause className="w-5 h-5" />
              <span>Pause</span>
            </button>
            <button
              onClick={stopTimer}
              className="flex-1 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <Square className="w-5 h-5" />
              <span>Stop & Save</span>
            </button>
          </div>
        )}
      </motion.div>

      {/* Recent Time Entries */}
      {showTimeLog && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/30 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50"
        >
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Recent Time Entries
          </h4>
          
          <div className="space-y-3">
            {timeEntries.map((entry) => {
              const project = projects.find(p => p._id === entry.projectId);
              const task = tasks.find(t => t._id === entry.taskId);
              const IconComponent = typeIcons[entry.type];
              
              return (
                <div
                  key={entry._id}
                  className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded ${typeColors[entry.type]} text-white`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{entry.description}</p>
                      <p className="text-slate-400 text-xs">
                        {project?.name} {task && `• ${task.title}`}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {new Date(entry.startTime).toLocaleDateString()} • {formatDuration(entry.duration)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded text-xs ${
                      entry.isApproved ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'
                    }`}>
                      {entry.isApproved ? 'Approved' : 'Pending'}
                    </div>
                    <button className="text-slate-400 hover:text-white transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
            
            {timeEntries.length === 0 && (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-400">No time entries yet</p>
                <p className="text-slate-500 text-sm">Start tracking your time to see entries here</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TimeTracker; 