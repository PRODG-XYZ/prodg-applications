'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  CheckSquare,
  Clock,
  User,
  MessageSquare,
  AlertCircle,
  Plus,
  Filter,
  Calendar,
  Tag,
  Paperclip,
  MoreHorizontal
} from 'lucide-react';

interface TaskBoardProps {
  tasks: any[];
  projects: any[];
  personnelId: string;
  onTaskUpdate?: (taskId: string, updates: any) => void;
  onTaskCreate?: (taskData: any) => void;
}

type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed' | 'blocked';
type TaskFilter = 'all' | 'assigned_to_me' | 'created_by_me' | 'high_priority';

const statusConfig = {
  todo: {
    title: 'To Do',
    color: 'bg-slate-600',
    textColor: 'text-slate-300',
    borderColor: 'border-slate-600',
    bgColor: 'bg-slate-700/30'
  },
  in_progress: {
    title: 'In Progress',
    color: 'bg-blue-600',
    textColor: 'text-blue-300',
    borderColor: 'border-blue-600',
    bgColor: 'bg-blue-600/10'
  },
  review: {
    title: 'In Review',
    color: 'bg-yellow-600',
    textColor: 'text-yellow-300',
    borderColor: 'border-yellow-600',
    bgColor: 'bg-yellow-600/10'
  },
  completed: {
    title: 'Completed',
    color: 'bg-green-600',
    textColor: 'text-green-300',
    borderColor: 'border-green-600',
    bgColor: 'bg-green-600/10'
  },
  blocked: {
    title: 'Blocked',
    color: 'bg-red-600',
    textColor: 'text-red-300',
    borderColor: 'border-red-600',
    bgColor: 'bg-red-600/10'
  }
};

const priorityConfig = {
  low: { color: 'text-slate-400', bg: 'bg-slate-600/20' },
  medium: { color: 'text-blue-400', bg: 'bg-blue-600/20' },
  high: { color: 'text-orange-400', bg: 'bg-orange-600/20' },
  urgent: { color: 'text-red-400', bg: 'bg-red-600/20' }
};

interface TaskCardProps {
  task: any;
  project?: any;
  onUpdate?: (taskId: string, updates: any) => void;
}

const TaskCard = ({ task, project, onUpdate }: TaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityStyle = priorityConfig[task.priority as keyof typeof priorityConfig];
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date();

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      whileHover={{ scale: 1.02 }}
      className={`bg-slate-800/50 backdrop-blur-lg rounded-lg p-4 border border-slate-700/50 cursor-pointer hover:border-slate-600/50 transition-all ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-white font-medium text-sm leading-tight">{task.title}</h4>
          {project && (
            <p className="text-slate-400 text-xs mt-1">{project.name}</p>
          )}
        </div>
        <div className="flex items-center space-x-1 ml-2">
          <div className={`px-2 py-1 rounded text-xs font-medium ${priorityStyle.color} ${priorityStyle.bg}`}>
            {task.priority}
          </div>
          <button className="text-slate-400 hover:text-white transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-slate-300 text-xs mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 3).map((tag: string, index: number) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded"
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="text-slate-400 text-xs">+{task.tags.length - 3} more</span>
          )}
        </div>
      )}

      {/* Due Date */}
      {dueDate && (
        <div className={`flex items-center space-x-1 mb-3 text-xs ${
          isOverdue ? 'text-red-400' : 'text-slate-400'
        }`}>
          <Calendar className="w-3 h-3" />
          <span>{dueDate.toLocaleDateString()}</span>
          {isOverdue && <AlertCircle className="w-3 h-3" />}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          {/* Time estimate */}
          <div className="flex items-center space-x-1 text-slate-400">
            <Clock className="w-3 h-3" />
            <span>{task.estimatedHours || 0}h</span>
          </div>

          {/* Comments */}
          {task.comments && task.comments.length > 0 && (
            <div className="flex items-center space-x-1 text-slate-400">
              <MessageSquare className="w-3 h-3" />
              <span>{task.comments.length}</span>
            </div>
          )}

          {/* Attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <div className="flex items-center space-x-1 text-slate-400">
              <Paperclip className="w-3 h-3" />
              <span>{task.attachments.length}</span>
            </div>
          )}
        </div>

        {/* Assignee */}
        <div className="flex items-center space-x-1 text-slate-400">
          <User className="w-3 h-3" />
          <span className="text-xs truncate max-w-16">
            {task.assigneeName || 'Unassigned'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

interface TaskColumnProps {
  status: TaskStatus;
  tasks: any[];
  projects: any[];
  onTaskUpdate?: (taskId: string, updates: any) => void;
  onTaskCreate?: (status: TaskStatus) => void;
}

const TaskColumn = ({ status, tasks, projects, onTaskUpdate, onTaskCreate }: TaskColumnProps) => {
  const config = statusConfig[status];
  const taskIds = tasks.map(task => task._id);

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className={`p-4 rounded-t-lg border-b ${config.bgColor} ${config.borderColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${config.color}`} />
            <h3 className={`font-semibold ${config.textColor}`}>
              {config.title}
            </h3>
            <span className={`text-sm ${config.textColor} opacity-75`}>
              ({tasks.length})
            </span>
          </div>
          <button
            onClick={() => onTaskCreate?.(status)}
            className={`p-1 rounded hover:bg-white/10 transition-colors ${config.textColor}`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tasks Container */}
      <div className="flex-1 p-4 bg-slate-900/20 rounded-b-lg min-h-96">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {tasks.map((task) => {
              const project = projects.find(p => p._id === task.projectId);
              return (
                <TaskCard
                  key={task._id}
                  task={task}
                  project={project}
                  onUpdate={onTaskUpdate}
                />
              );
            })}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};

const TaskBoard = ({ tasks, projects, personnelId, onTaskUpdate, onTaskCreate }: TaskBoardProps) => {
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('todo');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    switch (filter) {
      case 'assigned_to_me':
        filtered = tasks.filter(task => task.assignee === personnelId);
        break;
      case 'created_by_me':
        filtered = tasks.filter(task => task.reporter === personnelId);
        break;
      case 'high_priority':
        filtered = tasks.filter(task => ['high', 'urgent'].includes(task.priority));
        break;
      default:
        break;
    }

    return filtered;
  }, [tasks, filter, personnelId]);

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, any[]> = {
      todo: [],
      in_progress: [],
      review: [],
      completed: [],
      blocked: []
    };

    filteredTasks.forEach(task => {
      if (grouped[task.status as TaskStatus]) {
        grouped[task.status as TaskStatus].push(task);
      }
    });

    return grouped;
  }, [filteredTasks]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    // Find current task
    const task = tasks.find(t => t._id === taskId);
    if (!task || task.status === newStatus) return;

    // Update task status
    onTaskUpdate?.(taskId, { status: newStatus });
  };

  const handleTaskCreate = (status: TaskStatus) => {
    setNewTaskStatus(status);
    setShowCreateForm(true);
  };

  const activeTask = activeId ? tasks.find(task => task._id === activeId) : null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Task Board</h2>
          <p className="text-slate-400 mt-1">
            Manage and track your tasks across different stages
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as TaskFilter)}
            className="px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Tasks</option>
            <option value="assigned_to_me">Assigned to Me</option>
            <option value="created_by_me">Created by Me</option>
            <option value="high_priority">High Priority</option>
          </select>

          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = tasksByStatus[status as TaskStatus].length;
          return (
            <div
              key={status}
              className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}
            >
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${config.color}`} />
                <span className={`text-sm font-medium ${config.textColor}`}>
                  {config.title}
                </span>
              </div>
              <p className={`text-2xl font-bold mt-2 ${config.textColor}`}>
                {count}
              </p>
            </div>
          );
        })}
      </div>

      {/* Task Board */}
      <div className="flex-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-5 gap-4 h-full">
            {Object.entries(statusConfig).map(([status]) => (
              <TaskColumn
                key={status}
                status={status as TaskStatus}
                tasks={tasksByStatus[status as TaskStatus]}
                projects={projects}
                onTaskUpdate={onTaskUpdate}
                onTaskCreate={handleTaskCreate}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <TaskCard
                task={activeTask}
                project={projects.find(p => p._id === activeTask.projectId)}
                onUpdate={onTaskUpdate}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Create Task Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Create New Task
            </h3>
            <p className="text-slate-400 mb-4">
              Task will be created in {statusConfig[newTaskStatus].title} column
            </p>
            {/* Add task creation form here */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onTaskCreate?.({ status: newTaskStatus });
                  setShowCreateForm(false);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBoard; 