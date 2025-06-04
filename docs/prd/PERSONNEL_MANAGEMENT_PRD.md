# Personnel Management Dashboard Implementation PRD
*Product Requirements Document for Personnel Management Dashboard Module*

## Overview
Implement a comprehensive administrative dashboard for managing personnel, teams, projects, and organizational structure. This system provides HR administrators and managers with tools to oversee the complete employee lifecycle from onboarding to performance management, creating a centralized hub for human resource operations.

## Technical Architecture

### Tech Stack Integration
- **Framework**: Next.js 15 with React 19
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Enhanced admin authentication with granular permissions
- **UI Components**: Existing UI library (Tailwind CSS + custom components)
- **Charts & Analytics**: Chart.js for personnel analytics and reporting
- **Export Features**: PDF/Excel generation for reports
- **Real-time Features**: WebSocket for live updates and notifications
- **Email Integration**: Nodemailer for automated communications
- **State Management**: React hooks with context for complex state
- **API**: Next.js API routes with role-based middleware

### Database Schema Extensions

#### Enhanced Admin Collection
```typescript
interface IAdmin {
  _id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'hr_admin' | 'manager' | 'team_lead';
  permissions: AdminPermissions;
  department?: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    phone?: string;
  };
  managedDepartments: string[];
  managedPersonnel: string[];
  lastLoginAt: Date;
  createdAt: Date;
}

interface AdminPermissions {
  canManagePersonnel: boolean;
  canCreateProjects: boolean;
  canViewAllProjects: boolean;
  canManageRoles: boolean;
  canViewAnalytics: boolean;
  canExportData: boolean;
  canManageOnboarding: boolean;
  canApproveTimeoff: boolean;
  canConductReviews: boolean;
}
```

#### New Department Collection
```typescript
interface IDepartment {
  _id: string;
  name: string;
  description: string;
  head: string; // Personnel ID
  budget: number;
  personnelCount: number;
  projects: string[]; // Project IDs
  goals: {
    title: string;
    description: string;
    deadline: Date;
    status: 'not_started' | 'in_progress' | 'completed';
    assignedTo: string[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### New Performance Review Collection
```typescript
interface IPerformanceReview {
  _id: string;
  personnelId: string;
  reviewerId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  type: 'quarterly' | 'annual' | 'probation' | 'promotion';
  status: 'scheduled' | 'in_progress' | 'completed' | 'approved';
  metrics: {
    category: string;
    score: number; // 1-5 scale
    comments: string;
  }[];
  goals: {
    achieved: string[];
    missed: string[];
    upcoming: string[];
  };
  feedback: {
    strengths: string;
    improvements: string;
    recommendations: string;
  };
  salary: {
    current: number;
    recommended: number;
    approved?: number;
  };
  createdAt: Date;
  completedAt?: Date;
}
```

#### New Time Off Collection
```typescript
interface ITimeOff {
  _id: string;
  personnelId: string;
  type: 'vacation' | 'sick' | 'personal' | 'parental' | 'bereavement';
  startDate: Date;
  endDate: Date;
  days: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reason?: string;
  approvedBy?: string;
  rejectionReason?: string;
  documents?: string[]; // S3 URLs for medical certificates, etc.
  createdAt: Date;
  processedAt?: Date;
}
```

## Core Features

### 1. Personnel Overview & Management

#### Personnel Directory
- **Complete Personnel List**: Searchable and filterable personnel database
- **Organizational Chart**: Visual hierarchy with drag-and-drop restructuring
- **Department Management**: Department creation, personnel assignment
- **Role Management**: Role assignment and permission configuration

#### Personnel Analytics
```typescript
interface PersonnelAnalytics {
  totalPersonnel: number;
  departmentBreakdown: { department: string; count: number }[];
  roleDistribution: { role: string; count: number }[];
  averageTenure: number;
  turnoverRate: number;
  activeProjects: number;
  utilizationRate: number;
}

const PersonnelOverview = () => {
  const [analytics, setAnalytics] = useState<PersonnelAnalytics>();
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('quarter');
  
  return (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-4 gap-6">
        <MetricsCard title="Total Personnel" value={analytics?.totalPersonnel} />
        <MetricsCard title="Active Projects" value={analytics?.activeProjects} />
        <MetricsCard title="Avg Tenure" value={analytics?.averageTenure} unit="months" />
        <MetricsCard title="Utilization" value={analytics?.utilizationRate} unit="%" />
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8">
        <DepartmentChart data={analytics?.departmentBreakdown} />
        <RoleDistributionChart data={analytics?.roleDistribution} />
      </div>
      
      <PersonnelTable 
        personnel={personnel}
        onEdit={handlePersonnelEdit}
        onDeactivate={handlePersonnelDeactivate}
      />
    </div>
  );
};
```

### 2. Onboarding Management

#### Onboarding Pipeline
- **New Hire Tracking**: Monitor onboarding progress for all new personnel
- **Task Assignment**: Assign and track completion of onboarding tasks
- **Document Management**: Handle employment documents and compliance
- **Mentor Assignment**: Pair new hires with experienced team members

#### Onboarding Dashboard
```typescript
interface OnboardingStatus {
  personnelId: string;
  name: string;
  startDate: Date;
  completionPercentage: number;
  currentStage: string;
  overdueTasks: number;
  assignedMentor?: string;
}

const OnboardingDashboard = () => {
  const [onboardingPersonnel, setOnboardingPersonnel] = useState<OnboardingStatus[]>([]);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Onboarding Progress</h2>
        <Button onClick={handleAddNewHire}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Hire
        </Button>
      </div>
      
      <div className="grid gap-4">
        {onboardingPersonnel.map(person => (
          <OnboardingCard
            key={person.personnelId}
            personnel={person}
            onUpdateProgress={handleProgressUpdate}
          />
        ))}
      </div>
    </div>
  );
};
```

### 3. Project & Resource Management

#### Project Oversight
- **Project Portfolio**: Complete view of all active projects
- **Resource Allocation**: Personnel assignment and workload management
- **Timeline Management**: Project scheduling and milestone tracking
- **Budget Tracking**: Project costs and resource utilization

#### Resource Planning
```typescript
interface ResourceAllocation {
  personnelId: string;
  name: string;
  role: string;
  availability: number; // percentage
  currentProjects: {
    projectId: string;
    projectName: string;
    allocation: number;
    priority: string;
  }[];
  skills: string[];
  hourlyRate: number;
}

const ResourceManagement = () => {
  const [resources, setResources] = useState<ResourceAllocation[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <ProjectResourceMatrix 
          projects={projects}
          resources={resources}
          onResourceAssign={handleResourceAssign}
        />
      </div>
      
      <div>
        <ResourceAvailability resources={resources} />
        <SkillMatrix personnel={personnel} />
      </div>
    </div>
  );
};
```

### 4. Performance Management

#### Performance Reviews
- **Review Scheduling**: Automated review cycle management
- **360-Degree Feedback**: Multi-source feedback collection
- **Performance Tracking**: KPI monitoring and goal management
- **Career Development**: Growth planning and promotion tracking

#### Review Management System
```typescript
interface ReviewCycle {
  id: string;
  name: string;
  type: 'quarterly' | 'annual';
  startDate: Date;
  endDate: Date;
  participants: string[];
  status: 'planning' | 'active' | 'completed';
  completionRate: number;
}

const PerformanceManagement = () => {
  const [reviewCycles, setReviewCycles] = useState<ReviewCycle[]>([]);
  const [activeReviews, setActiveReviews] = useState<IPerformanceReview[]>([]);
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Performance Management</h2>
        <Button onClick={handleCreateReviewCycle}>
          Create Review Cycle
        </Button>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8">
        <ReviewCyclesList 
          cycles={reviewCycles}
          onCycleSelect={handleCycleSelect}
        />
        <ActiveReviewsList 
          reviews={activeReviews}
          onReviewUpdate={handleReviewUpdate}
        />
      </div>
      
      <PerformanceAnalytics 
        departmentId={selectedDepartment}
        timeRange={timeRange}
      />
    </div>
  );
};
```

### 5. Time & Attendance Management

#### Time Tracking Oversight
- **Timesheet Approvals**: Review and approve personnel timesheets
- **Attendance Monitoring**: Track attendance patterns and anomalies
- **Time Off Management**: Handle leave requests and approvals
- **Overtime Tracking**: Monitor and manage overtime hours

#### Time Off Dashboard
```typescript
const TimeOffManagement = () => {
  const [pendingRequests, setPendingRequests] = useState<ITimeOff[]>([]);
  const [timeOffAnalytics, setTimeOffAnalytics] = useState<TimeOffAnalytics>();
  
  const handleApproval = async (requestId: string, approved: boolean, reason?: string) => {
    const response = await fetch(`/api/admin/time-off/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: approved ? 'approved' : 'rejected',
        rejectionReason: reason
      })
    });
    
    if (response.ok) {
      // Refresh data and send notification
      refreshTimeOffData();
      sendTimeOffNotification(requestId, approved);
    }
  };
  
  return (
    <div className="space-y-6">
      <TimeOffStats analytics={timeOffAnalytics} />
      <PendingRequestsList 
        requests={pendingRequests}
        onApprove={handleApproval}
      />
      <TimeOffCalendar personnel={personnel} />
    </div>
  );
};
```

### 6. Analytics & Reporting

#### HR Analytics
- **Personnel Metrics**: Headcount, turnover, satisfaction scores
- **Performance Analytics**: Review scores, goal achievement rates
- **Project Analytics**: Delivery rates, resource utilization
- **Compliance Reporting**: Training completion, document status

#### Executive Dashboard
```typescript
interface ExecutiveMetrics {
  personnelGrowth: { month: string; count: number }[];
  performanceDistribution: { score: number; count: number }[];
  projectDelivery: { onTime: number; delayed: number; cancelled: number };
  budgetUtilization: number;
  satisfactionScore: number;
}

const ExecutiveDashboard = () => {
  const [metrics, setMetrics] = useState<ExecutiveMetrics>();
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  
  return (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-5 gap-6">
        <MetricsCard title="Total Personnel" value={metrics?.personnelGrowth?.slice(-1)[0]?.count} />
        <MetricsCard title="Avg Performance" value={calculateAveragePerformance(metrics)} />
        <MetricsCard title="Project Success" value={calculateProjectSuccess(metrics)} unit="%" />
        <MetricsCard title="Budget Usage" value={metrics?.budgetUtilization} unit="%" />
        <MetricsCard title="Satisfaction" value={metrics?.satisfactionScore} unit="/5" />
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8">
        <PersonnelGrowthChart data={metrics?.personnelGrowth} />
        <PerformanceDistributionChart data={metrics?.performanceDistribution} />
      </div>
      
      <ProjectDeliveryAnalytics data={metrics?.projectDelivery} />
    </div>
  );
};
```

## File Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── personnel/
│   │   │   ├── page.tsx              # Personnel overview
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx          # Personnel details
│   │   │   ├── onboarding/
│   │   │   │   └── page.tsx          # Onboarding management
│   │   │   ├── performance/
│   │   │   │   └── page.tsx          # Performance reviews
│   │   │   ├── time-off/
│   │   │   │   └── page.tsx          # Time off management
│   │   │   └── departments/
│   │   │       └── page.tsx          # Department management
│   │   ├── projects/
│   │   │   ├── page.tsx              # Project overview
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx          # Project details
│   │   │   └── resources/
│   │   │       └── page.tsx          # Resource allocation
│   │   ├── analytics/
│   │   │   ├── page.tsx              # HR analytics
│   │   │   ├── executive/
│   │   │   │   └── page.tsx          # Executive dashboard
│   │   │   └── reports/
│   │   │       └── page.tsx          # Custom reports
│   │   └── settings/
│   │       └── page.tsx              # System settings
│   └── api/
│       └── admin/
│           ├── personnel/
│           │   ├── route.ts          # Personnel CRUD
│           │   ├── [id]/
│           │   │   └── route.ts      # Personnel details
│           │   └── bulk-actions/
│           │       └── route.ts      # Bulk operations
│           ├── onboarding/
│           │   └── route.ts          # Onboarding management
│           ├── performance/
│           │   └── route.ts          # Performance reviews
│           ├── time-off/
│           │   └── route.ts          # Time off approvals
│           ├── projects/
│           │   └── route.ts          # Project management
│           ├── departments/
│           │   └── route.ts          # Department management
│           ├── analytics/
│           │   └── route.ts          # Analytics data
│           └── reports/
│               └── route.ts          # Report generation
├── components/
│   └── admin/
│       ├── PersonnelManagement.tsx   # Main personnel dashboard
│       ├── OnboardingTracker.tsx     # Onboarding progress
│       ├── PerformanceReviews.tsx    # Review management
│       ├── TimeOffApprovals.tsx      # Time off handling
│       ├── ProjectResourceMatrix.tsx # Resource allocation
│       ├── DepartmentManager.tsx     # Department management
│       ├── AnalyticsDashboard.tsx    # Analytics display
│       ├── ReportBuilder.tsx         # Custom report creation
│       └── BulkActions.tsx           # Bulk operations
├── lib/
│   ├── models/
│   │   ├── Admin.ts                  # Admin user model
│   │   ├── Department.ts             # Department model
│   │   ├── PerformanceReview.ts      # Review model
│   │   └── TimeOff.ts                # Time off model
│   ├── admin/
│   │   ├── personnel.ts              # Personnel management
│   │   ├── onboarding.ts             # Onboarding utilities
│   │   ├── performance.ts            # Performance management
│   │   ├── analytics.ts              # Analytics calculations
│   │   └── reports.ts                # Report generation
│   └── hooks/
│       ├── usePersonnelManagement.ts # Personnel operations
│       ├── usePerformanceReviews.ts  # Review management
│       └── useAnalytics.ts           # Analytics data
```

## Implementation Phases

### Phase 1: Core Personnel Management (Week 1)
1. Personnel directory and search functionality
2. Department and role management
3. Basic analytics and reporting
4. Permission system implementation

### Phase 2: Onboarding & Performance (Week 2)
1. Onboarding workflow management
2. Performance review system
3. Goal setting and tracking
4. Document management

### Phase 3: Resource & Project Management (Week 3)
1. Resource allocation matrix
2. Project assignment and tracking
3. Time tracking oversight
4. Capacity planning tools

### Phase 4: Advanced Analytics & Automation (Week 4)
1. Advanced analytics and insights
2. Automated workflow triggers
3. Report generation and export
4. Integration with external systems

## Core Components

### 1. PersonnelManagement.tsx
```typescript
interface PersonnelManagementProps {
  personnel: IPersonnel[];
  departments: IDepartment[];
  permissions: AdminPermissions;
}

const PersonnelManagement = ({ personnel, departments, permissions }: PersonnelManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedPersonnel, setSelectedPersonnel] = useState<string[]>([]);
  
  const filteredPersonnel = useMemo(() => {
    return personnel.filter(person => {
      const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          person.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || person.department === selectedDepartment;
      return matchesSearch && matchesDepartment;
    });
  }, [personnel, searchTerm, selectedDepartment]);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Personnel Management</h1>
        {permissions.canManagePersonnel && (
          <div className="flex gap-2">
            <Button onClick={handleBulkAction} disabled={selectedPersonnel.length === 0}>
              Bulk Actions
            </Button>
            <Button onClick={handleAddPersonnel}>
              <Plus className="w-4 h-4 mr-2" />
              Add Personnel
            </Button>
          </div>
        )}
      </div>
      
      <PersonnelFilters 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={setSelectedDepartment}
        departments={departments}
      />
      
      <PersonnelTable 
        personnel={filteredPersonnel}
        selectedItems={selectedPersonnel}
        onSelectionChange={setSelectedPersonnel}
        permissions={permissions}
      />
    </div>
  );
};
```

### 2. PerformanceReviews.tsx
```typescript
interface PerformanceReviewsProps {
  reviews: IPerformanceReview[];
  reviewCycles: ReviewCycle[];
  onReviewUpdate: (reviewId: string, updates: Partial<IPerformanceReview>) => void;
}

const PerformanceReviews = ({ reviews, reviewCycles, onReviewUpdate }: PerformanceReviewsProps) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'in_progress' | 'completed'>('pending');
  const [selectedCycle, setSelectedCycle] = useState<string>('all');
  
  const filteredReviews = reviews.filter(review => {
    const matchesStatus = review.status === activeTab || 
                         (activeTab === 'pending' && review.status === 'scheduled');
    const matchesCycle = selectedCycle === 'all' || review.cycleId === selectedCycle;
    return matchesStatus && matchesCycle;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Performance Reviews</h2>
        <Button onClick={handleCreateReview}>
          Schedule Review
        </Button>
      </div>
      
      <div className="flex space-x-4">
        <ReviewCycleSelector 
          cycles={reviewCycles}
          selected={selectedCycle}
          onChange={setSelectedCycle}
        />
        <ReviewStatusTabs 
          activeTab={activeTab}
          onChange={setActiveTab}
          counts={getReviewCounts(reviews)}
        />
      </div>
      
      <ReviewsList 
        reviews={filteredReviews}
        onReviewUpdate={onReviewUpdate}
        onReviewComplete={handleReviewComplete}
      />
    </div>
  );
};
```

### 3. ResourceAllocationMatrix.tsx
```typescript
interface ResourceMatrixProps {
  projects: IProject[];
  personnel: IPersonnel[];
  allocations: ResourceAllocation[];
  onAllocationChange: (personnelId: string, projectId: string, allocation: number) => void;
}

const ResourceAllocationMatrix = ({ projects, personnel, allocations, onAllocationChange }: ResourceMatrixProps) => {
  const [draggedResource, setDraggedResource] = useState<string | null>(null);
  
  const getAllocation = (personnelId: string, projectId: string) => {
    const allocation = allocations.find(a => 
      a.personnelId === personnelId && 
      a.currentProjects.some(p => p.projectId === projectId)
    );
    return allocation?.currentProjects.find(p => p.projectId === projectId)?.allocation || 0;
  };
  
  return (
    <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-6 overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left p-2 text-slate-300">Personnel</th>
            {projects.map(project => (
              <th key={project._id} className="text-center p-2 text-slate-300 min-w-[100px]">
                {project.name}
              </th>
            ))}
            <th className="text-center p-2 text-slate-300">Total</th>
          </tr>
        </thead>
        <tbody>
          {personnel.map(person => (
            <tr key={person._id} className="border-t border-slate-700">
              <td className="p-2">
                <div className="flex items-center space-x-2">
                  <img 
                    src={person.profile.avatar || '/default-avatar.png'} 
                    alt={person.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-white font-medium">{person.name}</span>
                </div>
              </td>
              {projects.map(project => (
                <td key={project._id} className="p-2 text-center">
                  <AllocationInput 
                    value={getAllocation(person._id, project._id)}
                    onChange={(value) => onAllocationChange(person._id, project._id, value)}
                    max={100}
                  />
                </td>
              ))}
              <td className="p-2 text-center">
                <span className="text-white font-medium">
                  {calculateTotalAllocation(person._id, allocations)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

## API Endpoints

### Personnel Management APIs
```typescript
// GET /api/admin/personnel
// Query: ?department=&role=&status=&search=
// Returns: Filtered personnel list with pagination

// POST /api/admin/personnel
// Body: Personnel creation data
// Purpose: Add new personnel

// PATCH /api/admin/personnel/[id]
// Body: Personnel updates
// Purpose: Update personnel information

// DELETE /api/admin/personnel/[id]
// Purpose: Deactivate personnel

// POST /api/admin/personnel/bulk-actions
// Body: { action: string, personnelIds: string[] }
// Purpose: Bulk operations (role change, department transfer, etc.)
```

### Performance Management APIs
```typescript
// GET /api/admin/performance/reviews
// Query: ?cycle=&status=&department=
// Returns: Performance reviews with filters

// POST /api/admin/performance/reviews
// Body: Review creation data
// Purpose: Schedule new performance review

// PATCH /api/admin/performance/reviews/[id]
// Body: Review updates
// Purpose: Update review progress/scores

// POST /api/admin/performance/cycles
// Body: Review cycle data
// Purpose: Create new review cycle
```

### Time Off Management APIs
```typescript
// GET /api/admin/time-off
// Query: ?status=&department=&type=
// Returns: Time off requests

// PATCH /api/admin/time-off/[id]
// Body: { status: 'approved' | 'rejected', reason?: string }
// Purpose: Approve/reject time off requests

// GET /api/admin/time-off/analytics
// Query: ?start_date=&end_date=&department=
// Returns: Time off analytics and trends
```

### Analytics & Reporting APIs
```typescript
// GET /api/admin/analytics/personnel
// Query: ?department=&time_range=
// Returns: Personnel analytics and metrics

// GET /api/admin/analytics/performance
// Query: ?department=&review_cycle=
// Returns: Performance analytics

// POST /api/admin/reports/generate
// Body: Report configuration
// Purpose: Generate custom reports

// GET /api/admin/reports/export
// Query: ?type=&format=&filters=
// Returns: Exported report file
```

## Role-Based Access Control

### Admin Permission System
```typescript
type AdminRole = 'super_admin' | 'hr_admin' | 'manager' | 'team_lead';

const adminRolePermissions: Record<AdminRole, AdminPermissions> = {
  super_admin: {
    canManagePersonnel: true,
    canCreateProjects: true,
    canViewAllProjects: true,
    canManageRoles: true,
    canViewAnalytics: true,
    canExportData: true,
    canManageOnboarding: true,
    canApproveTimeoff: true,
    canConductReviews: true
  },
  hr_admin: {
    canManagePersonnel: true,
    canCreateProjects: false,
    canViewAllProjects: true,
    canManageRoles: false,
    canViewAnalytics: true,
    canExportData: true,
    canManageOnboarding: true,
    canApproveTimeoff: true,
    canConductReviews: true
  },
  manager: {
    canManagePersonnel: false, // Only their department
    canCreateProjects: true,
    canViewAllProjects: false, // Only their projects
    canManageRoles: false,
    canViewAnalytics: true, // Limited scope
    canExportData: false,
    canManageOnboarding: false,
    canApproveTimeoff: true, // Their team only
    canConductReviews: true // Their team only
  },
  team_lead: {
    canManagePersonnel: false,
    canCreateProjects: false,
    canViewAllProjects: false,
    canManageRoles: false,
    canViewAnalytics: false,
    canExportData: false,
    canManageOnboarding: false,
    canApproveTimeoff: false,
    canConductReviews: false
  }
};
```

## Real-time Features

### Administrative Notifications
```typescript
const useAdminNotifications = (adminId: string) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  
  useEffect(() => {
    const ws = new WebSocket(`/api/admin/notifications?adminId=${adminId}`);
    
    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      
      switch (notification.type) {
        case 'time_off_request':
          setNotifications(prev => [...prev, {
            id: notification.id,
            type: 'time_off',
            title: 'New Time Off Request',
            message: `${notification.personnelName} requested ${notification.days} days off`,
            priority: 'medium',
            actionUrl: `/admin/time-off`,
            isRead: false,
            createdAt: new Date()
          }]);
          break;
          
        case 'performance_review_due':
          setNotifications(prev => [...prev, {
            id: notification.id,
            type: 'performance',
            title: 'Performance Review Due',
            message: `Review for ${notification.personnelName} is due`,
            priority: 'high',
            actionUrl: `/admin/performance/${notification.reviewId}`,
            isRead: false,
            createdAt: new Date()
          }]);
          break;
          
        case 'onboarding_incomplete':
          setNotifications(prev => [...prev, {
            id: notification.id,
            type: 'onboarding',
            title: 'Onboarding Delayed',
            message: `${notification.personnelName} has overdue onboarding tasks`,
            priority: 'medium',
            actionUrl: `/admin/onboarding/${notification.personnelId}`,
            isRead: false,
            createdAt: new Date()
          }]);
          break;
      }
    };
    
    return () => ws.close();
  }, [adminId]);
  
  return notifications;
};
```

## Performance Considerations

### Caching Strategy
- **Personnel Data**: Cache for 10 minutes
- **Analytics Data**: Cache for 30 minutes
- **Department Structure**: Cache for 1 hour
- **Permission Mappings**: Cache for 4 hours

### Database Optimization
```typescript
// Optimized queries for admin dashboard
const getAdminDashboardData = async (adminId: string, permissions: AdminPermissions) => {
  const queries = [];
  
  if (permissions.canManagePersonnel) {
    queries.push(
      Personnel.countDocuments({ status: 'active' }),
      Personnel.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } }
      ])
    );
  }
  
  if (permissions.canViewAnalytics) {
    queries.push(
      PerformanceReview.find({ status: 'pending' }).count(),
      TimeOff.find({ status: 'pending' }).count()
    );
  }
  
  const results = await Promise.all(queries);
  return processAdminDashboardResults(results, permissions);
};

// Critical indexes for admin operations
PersonnelSchema.index({ department: 1, status: 1 });
PersonnelSchema.index({ manager: 1, status: 1 });
PerformanceReviewSchema.index({ reviewerId: 1, status: 1 });
TimeOffSchema.index({ status: 1, createdAt: -1 });
ProjectSchema.index({ 'team.lead': 1, status: 1 });
```

## Dependencies to Add

```json
{
  "dependencies": {
    "xlsx": "^0.18.5",
    "jspdf": "^2.5.1",
    "html2canvas": "^1.4.1",
    "react-select": "^5.8.0",
    "react-datepicker": "^4.21.0",
    "react-drag-drop-container": "^6.0.0"
  },
  "devDependencies": {
    "@types/xlsx": "^0.0.36",
    "@types/jspdf": "^2.3.0"
  }
}
```

## Security Considerations

### Data Access Control
- **Hierarchical Permissions**: Department/team-based data access
- **Audit Logging**: Track all administrative actions
- **Data Encryption**: Sensitive personnel data encryption
- **Export Controls**: Limit data export capabilities by role

### Compliance Features
```typescript
// GDPR compliance utilities
const handleDataSubjectRequest = async (requestType: 'access' | 'deletion' | 'portability', personnelId: string) => {
  switch (requestType) {
    case 'access':
      return await generatePersonnelDataReport(personnelId);
    case 'deletion':
      return await anonymizePersonnelData(personnelId);
    case 'portability':
      return await exportPersonnelData(personnelId, 'json');
  }
};

// Audit trail for sensitive operations
const logAdminAction = async (adminId: string, action: string, targetId: string, details: any) => {
  await AuditLog.create({
    adminId,
    action,
    targetType: 'personnel',
    targetId,
    details,
    ipAddress: getClientIP(),
    userAgent: getUserAgent(),
    timestamp: new Date()
  });
};
```

## Testing Requirements

### Unit Tests
- Role permission validation
- Analytics calculation accuracy
- Bulk operation handling
- Report generation logic

### Integration Tests
- Complete performance review workflow
- Time off approval process
- Personnel onboarding pipeline
- Resource allocation accuracy

### E2E Tests
- Admin user journey through personnel management
- Multi-role collaboration scenarios
- Data export and import workflows
- Notification delivery and handling

---

**Implementation Priority**: High
**Estimated Effort**: 4 weeks
**Dependencies**: Enhanced admin authentication system
**Risk Level**: Medium (complex permission system) 