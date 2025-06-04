# Personnel Dashboard Implementation PRD
*Product Requirements Document for Personnel Dashboard Module*

## Overview
Implement a comprehensive personnel-facing dashboard for accepted applicants who have become team members. This dashboard facilitates onboarding, project management, team collaboration, and professional development within the organization. It transforms the recruitment platform into a complete employee lifecycle management system.

## Technical Architecture

### Tech Stack Integration
- **Framework**: Next.js 15 with React 19
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Role-based authentication (extends existing admin auth)
- **UI Components**: Existing UI library (Tailwind CSS + custom components)
- **Real-time Features**: WebSocket for team collaboration and notifications
- **File Management**: AWS S3 for document storage and project files
- **Calendar Integration**: Calendar API for scheduling and time tracking
- **State Management**: React hooks with context for global state
- **API**: Next.js API routes with middleware for role validation

### Database Schema Extensions

#### New Personnel Collection
```typescript
interface IPersonnel {
  _id: string;
  applicationId: string; // Reference to original application
  employeeId: string; // Unique employee identifier
  email: string;
  name: string;
  role: string;
  department: string;
  startDate: Date;
  manager?: string; // Personnel ID of manager
  directReports: string[]; // Array of Personnel IDs
  status: 'onboarding' | 'active' | 'on_leave' | 'terminated';
  profile: {
    avatar?: string;
    bio?: string;
    skills: string[];
    certifications: string[];
    socialLinks: {
      github?: string;
      linkedin?: string;
      portfolio?: string;
    };
  };
  preferences: {
    timezone: string;
    workingHours: {
      start: string;
      end: string;
    };
    notifications: {
      email: boolean;
      push: boolean;
      slack: boolean;
    };
  };
  onboarding: {
    tasksCompleted: string[];
    documentsUploaded: string[];
    meetingsScheduled: string[];
    completionPercentage: number;
  };
  createdAt: Date;
  lastActiveAt: Date;
}
```

#### New Project Collection
```typescript
interface IProject {
  _id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: Date;
  endDate?: Date;
  estimatedHours: number;
  actualHours: number;
  budget?: number;
  team: {
    lead: string; // Personnel ID
    members: string[]; // Array of Personnel IDs
    stakeholders: string[];
  };
  tasks: string[]; // Array of Task IDs
  documents: string[]; // S3 URLs
  tags: string[];
  client?: string;
  repository?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### New Task Collection
```typescript
interface ITask {
  _id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string; // Personnel ID
  reporter: string; // Personnel ID
  estimatedHours: number;
  actualHours: number;
  dueDate?: Date;
  tags: string[];
  attachments: string[];
  comments: {
    author: string;
    message: string;
    timestamp: Date;
  }[];
  dependencies: string[]; // Array of Task IDs
  createdAt: Date;
  updatedAt: Date;
}
```

#### New TimeEntry Collection
```typescript
interface ITimeEntry {
  _id: string;
  personnelId: string;
  projectId: string;
  taskId?: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  type: 'work' | 'meeting' | 'break' | 'training';
  isApproved: boolean;
  approvedBy?: string;
  createdAt: Date;
}
```

## Core Features

### 1. Onboarding & Profile Management

#### Digital Onboarding
- **Welcome Portal**: Personalized onboarding journey
- **Task Checklist**: Company-specific onboarding tasks
- **Document Center**: Employment documents, handbook, policies
- **Meet the Team**: Interactive team directory with roles

#### Profile Management
```typescript
interface ProfileProps {
  personnel: IPersonnel;
  isEditable: boolean;
}

const PersonnelProfile = ({ personnel, isEditable }: ProfileProps) => {
  return (
    <div className="space-y-6">
      <ProfileHeader personnel={personnel} />
      <SkillsSection skills={personnel.profile.skills} editable={isEditable} />
      <CertificationsSection certs={personnel.profile.certifications} />
      <PreferencesSection preferences={personnel.preferences} editable={isEditable} />
    </div>
  );
};
```

### 2. Project & Task Management

#### Project Dashboard
- **Active Projects**: Current project assignments and status
- **Task Board**: Kanban-style task management
- **Timeline View**: Gantt chart for project planning
- **Resource Allocation**: Time and effort tracking

#### Task Management System
```typescript
interface TaskBoardProps {
  projects: IProject[];
  tasks: ITask[];
  personnelId: string;
}

const TaskBoard = ({ projects, tasks, personnelId }: TaskBoardProps) => {
  const [filter, setFilter] = useState<TaskFilter>('assigned_to_me');
  
  const filteredTasks = useMemo(() => {
    return filterTasks(tasks, filter, personnelId);
  }, [tasks, filter, personnelId]);
  
  return (
    <div className="grid grid-cols-4 gap-4">
      <TaskColumn status="todo" tasks={filteredTasks} />
      <TaskColumn status="in_progress" tasks={filteredTasks} />
      <TaskColumn status="review" tasks={filteredTasks} />
      <TaskColumn status="completed" tasks={filteredTasks} />
    </div>
  );
};
```

### 3. Team Collaboration

#### Team Directory
- **Organizational Chart**: Visual hierarchy and reporting structure
- **Contact Directory**: Team member profiles and contact information
- **Availability Status**: Real-time availability and working hours
- **Skill Matrix**: Team skills and expertise mapping

#### Communication Hub
```typescript
interface TeamChatProps {
  projectId?: string;
  teamMembers: IPersonnel[];
}

const TeamChat = ({ projectId, teamMembers }: TeamChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  // WebSocket connection for real-time messaging
  useEffect(() => {
    const ws = new WebSocket(`/api/personnel/chat?projectId=${projectId}`);
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };
    
    return () => ws.close();
  }, [projectId]);
  
  return (
    <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-6">
      <MessageList messages={messages} />
      <MessageInput 
        value={newMessage}
        onChange={setNewMessage}
        onSend={sendMessage}
        teamMembers={teamMembers}
      />
    </div>
  );
};
```

### 4. Time Tracking & Performance

#### Time Management
- **Time Tracking**: Start/stop timers for tasks and projects
- **Timesheet Management**: Weekly/monthly timesheet submission
- **Productivity Analytics**: Personal productivity insights
- **Goal Setting**: OKRs and performance objectives

#### Performance Dashboard
```typescript
interface PerformanceMetrics {
  tasksCompleted: number;
  averageTaskTime: number;
  projectsContributed: number;
  teamCollaboration: number;
  skillGrowth: string[];
}

const PerformanceDashboard = ({ personnelId }: { personnelId: string }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <MetricsCard title="Tasks Completed" value={metrics?.tasksCompleted} />
      <MetricsCard title="Average Task Time" value={metrics?.averageTaskTime} unit="hours" />
      <ProductivityChart data={metrics} timeRange={timeRange} />
      <SkillGrowthTracker skills={metrics?.skillGrowth} />
    </div>
  );
};
```

### 5. Learning & Development

#### Learning Hub
- **Training Modules**: Company-specific training programs
- **Skill Development**: Personalized learning paths
- **Certifications**: Track and manage professional certifications
- **Knowledge Base**: Company wiki and documentation

#### Resource Center
```typescript
interface LearningResource {
  id: string;
  title: string;
  type: 'video' | 'article' | 'course' | 'workshop';
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  completedBy: string[];
}

const LearningHub = ({ personnelId }: { personnelId: string }) => {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [filter, setFilter] = useState<LearningFilter>({ type: 'all', difficulty: 'all' });
  
  return (
    <div className="space-y-6">
      <LearningProgress personnelId={personnelId} />
      <ResourceFilters filter={filter} onChange={setFilter} />
      <ResourceGrid resources={filteredResources} />
    </div>
  );
};
```

## File Structure

```
src/
├── app/
│   ├── personnel/
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # Main personnel dashboard
│   │   │   ├── profile/
│   │   │   │   └── page.tsx          # Profile management
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx          # Projects overview
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Project details
│   │   │   ├── tasks/
│   │   │   │   └── page.tsx          # Task management
│   │   │   ├── team/
│   │   │   │   └── page.tsx          # Team directory
│   │   │   ├── time-tracking/
│   │   │   │   └── page.tsx          # Time tracking
│   │   │   ├── performance/
│   │   │   │   └── page.tsx          # Performance metrics
│   │   │   └── learning/
│   │   │       └── page.tsx          # Learning hub
│   │   ├── onboarding/
│   │   │   └── page.tsx              # Onboarding portal
│   │   └── layout.tsx                # Personnel layout
│   └── api/
│       └── personnel/
│           ├── profile/
│           │   └── route.ts          # Profile management
│           ├── projects/
│           │   ├── route.ts          # Projects CRUD
│           │   └── [id]/
│           │       └── route.ts      # Project details
│           ├── tasks/
│           │   └── route.ts          # Task management
│           ├── time-tracking/
│           │   └── route.ts          # Time entries
│           ├── team/
│           │   └── route.ts          # Team directory
│           ├── performance/
│           │   └── route.ts          # Performance metrics
│           └── learning/
│               └── route.ts          # Learning resources
├── components/
│   └── personnel/
│       ├── PersonnelDashboard.tsx    # Main dashboard
│       ├── OnboardingWizard.tsx      # Onboarding flow
│       ├── ProjectCard.tsx           # Project display
│       ├── TaskBoard.tsx             # Kanban task board
│       ├── TeamDirectory.tsx         # Team member list
│       ├── TimeTracker.tsx           # Time tracking widget
│       ├── PerformanceMetrics.tsx    # Performance display
│       ├── LearningHub.tsx           # Learning resources
│       └── ProfileEditor.tsx         # Profile editing
├── lib/
│   ├── models/
│   │   ├── Personnel.ts              # Personnel data model
│   │   ├── Project.ts                # Project data model
│   │   ├── Task.ts                   # Task data model
│   │   └── TimeEntry.ts              # Time tracking model
│   ├── personnel/
│   │   ├── auth.ts                   # Personnel authentication
│   │   ├── projects.ts               # Project utilities
│   │   ├── tasks.ts                  # Task management
│   │   ├── time-tracking.ts          # Time tracking logic
│   │   └── performance.ts            # Performance calculations
│   └── hooks/
│       ├── usePersonnelAuth.ts       # Authentication hook
│       ├── useProjects.ts            # Project management
│       ├── useTasks.ts               # Task management
│       └── useTimeTracking.ts        # Time tracking
```

## Implementation Phases

### Phase 1: Core Infrastructure & Onboarding (Week 1)
1. Create Personnel data models and authentication
2. Implement onboarding workflow and checklist
3. Build basic dashboard with profile management
4. Create personnel directory and team structure

### Phase 2: Project & Task Management (Week 2)
1. Implement project creation and management
2. Build Kanban-style task board
3. Add task assignment and tracking
4. Create project timeline and Gantt charts

### Phase 3: Collaboration & Communication (Week 3)
1. Team chat and messaging system
2. Real-time collaboration features
3. File sharing and document management
4. Calendar integration and scheduling

### Phase 4: Analytics & Learning (Week 4)
1. Time tracking and productivity analytics
2. Performance metrics and KPI dashboards
3. Learning management system
4. Reporting and export functionality

## Core Components

### 1. PersonnelDashboard.tsx
```typescript
interface PersonnelDashboardProps {
  personnel: IPersonnel;
  projects: IProject[];
  tasks: ITask[];
  metrics: PerformanceMetrics;
}

const PersonnelDashboard = ({ personnel, projects, tasks, metrics }: PersonnelDashboardProps) => {
  const [activeView, setActiveView] = useState<'overview' | 'projects' | 'tasks'>('overview');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <DashboardHeader personnel={personnel} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {activeView === 'overview' && <OverviewSection metrics={metrics} />}
            {activeView === 'projects' && <ProjectsSection projects={projects} />}
            {activeView === 'tasks' && <TasksSection tasks={tasks} />}
          </div>
          
          <div className="lg:col-span-1">
            <QuickActions personnel={personnel} />
            <UpcomingDeadlines tasks={tasks} />
            <TeamActivity />
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 2. TaskBoard.tsx
```typescript
interface TaskBoardProps {
  tasks: ITask[];
  projectId?: string;
  onTaskUpdate: (taskId: string, updates: Partial<ITask>) => void;
}

const TaskBoard = ({ tasks, projectId, onTaskUpdate }: TaskBoardProps) => {
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  
  const handleDrop = (status: TaskStatus, taskId: string) => {
    onTaskUpdate(taskId, { status });
    setDraggedTask(null);
  };
  
  const columns: TaskStatus[] = ['todo', 'in_progress', 'review', 'completed'];
  
  return (
    <div className="grid grid-cols-4 gap-4 h-full">
      {columns.map(status => (
        <TaskColumn
          key={status}
          status={status}
          tasks={tasks.filter(task => task.status === status)}
          onDrop={handleDrop}
          onTaskUpdate={onTaskUpdate}
        />
      ))}
    </div>
  );
};
```

### 3. TimeTracker.tsx
```typescript
interface TimeTrackerProps {
  personnelId: string;
  activeTask?: ITask;
}

const TimeTracker = ({ personnelId, activeTask }: TimeTrackerProps) => {
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const startTimer = async () => {
    const now = new Date();
    setStartTime(now);
    setIsTracking(true);
    
    // Create time entry
    await fetch('/api/personnel/time-tracking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personnelId,
        taskId: activeTask?._id,
        startTime: now,
        type: 'work'
      })
    });
  };
  
  const stopTimer = async () => {
    if (!startTime) return;
    
    const now = new Date();
    const duration = Math.floor((now.getTime() - startTime.getTime()) / 1000 / 60);
    
    setIsTracking(false);
    setElapsedTime(0);
    
    // Update time entry
    await fetch('/api/personnel/time-tracking', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endTime: now,
        duration
      })
    });
  };
  
  return (
    <div className="bg-slate-800/30 backdrop-blur-lg rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Time Tracker</h3>
        <TimeDisplay elapsedTime={elapsedTime} />
      </div>
      
      {activeTask && (
        <div className="mb-4 p-3 bg-slate-700/30 rounded-lg">
          <p className="text-sm text-slate-300">Tracking:</p>
          <p className="font-medium text-white">{activeTask.title}</p>
        </div>
      )}
      
      <div className="flex gap-2">
        {!isTracking ? (
          <Button onClick={startTimer} className="flex-1" disabled={!activeTask}>
            <Play className="w-4 h-4 mr-2" />
            Start
          </Button>
        ) : (
          <Button onClick={stopTimer} variant="destructive" className="flex-1">
            <Square className="w-4 h-4 mr-2" />
            Stop
          </Button>
        )}
      </div>
    </div>
  );
};
```

## API Endpoints

### Personnel Management APIs
```typescript
// GET /api/personnel/profile
// Returns: Personnel profile and preferences

// PATCH /api/personnel/profile
// Body: Profile updates
// Purpose: Update personnel information

// GET /api/personnel/dashboard-data
// Returns: Dashboard overview data (projects, tasks, metrics)
```

### Project Management APIs
```typescript
// GET /api/personnel/projects
// Returns: Projects assigned to personnel

// GET /api/personnel/projects/[id]
// Returns: Detailed project information

// PATCH /api/personnel/projects/[id]
// Body: Project updates
// Purpose: Update project information (if authorized)
```

### Task Management APIs
```typescript
// GET /api/personnel/tasks
// Query: ?status=&project=&assigned_to=
// Returns: Filtered task list

// POST /api/personnel/tasks
// Body: New task data
// Purpose: Create new task

// PATCH /api/personnel/tasks/[id]
// Body: Task updates
// Purpose: Update task status/details

// DELETE /api/personnel/tasks/[id]
// Purpose: Delete task (if authorized)
```

### Time Tracking APIs
```typescript
// GET /api/personnel/time-tracking
// Query: ?start_date=&end_date=&project=
// Returns: Time entries for period

// POST /api/personnel/time-tracking
// Body: { startTime, taskId?, projectId, type }
// Purpose: Start time tracking

// PATCH /api/personnel/time-tracking/[id]
// Body: { endTime, duration, description }
// Purpose: Complete time entry
```

## Role-Based Access Control

### Personnel Roles
```typescript
type PersonnelRole = 'employee' | 'senior' | 'lead' | 'manager' | 'director';

interface RolePermissions {
  canCreateProjects: boolean;
  canAssignTasks: boolean;
  canViewAllProjects: boolean;
  canApproveTimesheet: boolean;
  canAccessAnalytics: boolean;
  canManageTeam: boolean;
}

const rolePermissions: Record<PersonnelRole, RolePermissions> = {
  employee: {
    canCreateProjects: false,
    canAssignTasks: false,
    canViewAllProjects: false,
    canApproveTimesheet: false,
    canAccessAnalytics: false,
    canManageTeam: false
  },
  senior: {
    canCreateProjects: false,
    canAssignTasks: true,
    canViewAllProjects: false,
    canApproveTimesheet: false,
    canAccessAnalytics: true,
    canManageTeam: false
  },
  lead: {
    canCreateProjects: true,
    canAssignTasks: true,
    canViewAllProjects: true,
    canApproveTimesheet: true,
    canAccessAnalytics: true,
    canManageTeam: true
  },
  // ... other roles
};
```

## Real-time Features

### Live Collaboration
```typescript
// WebSocket connection for real-time updates
const useRealTimeUpdates = (personnelId: string) => {
  useEffect(() => {
    const ws = new WebSocket(`/api/personnel/ws?personnelId=${personnelId}`);
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      
      switch (update.type) {
        case 'task_assigned':
          showNotification(`New task assigned: ${update.taskTitle}`);
          break;
        case 'project_updated':
          refreshProjectData();
          break;
        case 'team_message':
          incrementUnreadMessages();
          break;
      }
    };
    
    return () => ws.close();
  }, [personnelId]);
};
```

### Notification System
```typescript
interface Notification {
  id: string;
  type: 'task' | 'project' | 'message' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}

const NotificationCenter = ({ personnelId }: { personnelId: string }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>
      
      {showNotifications && (
        <NotificationDropdown 
          notifications={notifications}
          onMarkAsRead={markAsRead}
        />
      )}
    </div>
  );
};
```

## Performance Considerations

### Caching Strategy
- **Profile Data**: Cache for 15 minutes
- **Project Data**: Cache for 5 minutes
- **Task Updates**: Real-time with optimistic updates
- **Team Directory**: Cache for 30 minutes

### Database Optimization
```typescript
// Optimized queries for personnel dashboard
const getPersonnelDashboardData = async (personnelId: string) => {
  const [personnel, projects, tasks, metrics] = await Promise.all([
    Personnel.findById(personnelId).lean(),
    Project.find({ 
      $or: [
        { 'team.members': personnelId },
        { 'team.lead': personnelId }
      ]
    }).lean(),
    Task.find({ assignee: personnelId, status: { $ne: 'completed' } }).lean(),
    calculatePersonnelMetrics(personnelId)
  ]);
  
  return { personnel, projects, tasks, metrics };
};

// Indexes for performance
PersonnelSchema.index({ email: 1 });
PersonnelSchema.index({ department: 1, status: 1 });
ProjectSchema.index({ 'team.members': 1, status: 1 });
TaskSchema.index({ assignee: 1, status: 1 });
TimeEntrySchema.index({ personnelId: 1, createdAt: -1 });
```

## Dependencies to Add

```json
{
  "dependencies": {
    "react-beautiful-dnd": "^13.1.1",
    "react-calendar": "^4.6.0",
    "recharts": "^2.8.0",
    "socket.io-client": "^4.7.0",
    "@dnd-kit/core": "^6.0.8",
    "@dnd-kit/sortable": "^7.0.2",
    "react-hook-form": "^7.56.4",
    "date-fns": "^3.6.0"
  },
  "devDependencies": {
    "@types/react-beautiful-dnd": "^13.1.6"
  }
}
```

## Security Considerations

### Data Access Control
- **Role-based Permissions**: Granular access control by role
- **Project-level Security**: Only access assigned projects
- **Time Tracking Validation**: Prevent time manipulation
- **Audit Logging**: Track all personnel actions

### Session Management
```typescript
// Enhanced session with role information
interface PersonnelSession {
  personnelId: string;
  email: string;
  role: PersonnelRole;
  permissions: RolePermissions;
  department: string;
  expiresAt: Date;
}

const withPersonnelAuth = (requiredPermission?: keyof RolePermissions) => {
  return async (req: NextRequest, res: NextResponse) => {
    const session = await getPersonnelSession(req);
    
    if (!session) {
      return NextResponse.redirect('/auth/login');
    }
    
    if (requiredPermission && !session.permissions[requiredPermission]) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    return session;
  };
};
```

## Testing Requirements

### Unit Tests
- Personnel authentication and role validation
- Task management operations
- Time tracking calculations
- Performance metrics generation

### Integration Tests
- Real-time collaboration features
- Project assignment workflows
- File upload and document management
- Calendar integration

### E2E Tests
- Complete onboarding workflow
- Project lifecycle from creation to completion
- Team collaboration scenarios
- Performance review process

---

**Implementation Priority**: High
**Estimated Effort**: 4 weeks
**Dependencies**: Role-based authentication system
**Risk Level**: Medium (complex role management) 