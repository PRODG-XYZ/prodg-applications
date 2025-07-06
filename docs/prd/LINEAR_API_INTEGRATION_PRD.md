# Linear API Integration PRD
*Product Requirements Document for Linear API Integration with Personnel Portals*

## 1. Overview

### 1.1 Purpose
This document outlines the requirements for integrating the Linear API into PeopleOS's personnel, team, and project management portals. The integration will enable seamless task and project management capabilities, enhancing collaboration and workflow efficiency.

### 1.2 Business Objective
Create a unified experience where personnel can manage their tasks, projects, and workflows without context switching between Linear and PeopleOS. This integration aims to increase productivity, improve project visibility, and streamline the development lifecycle.

### 1.3 Success Metrics
- 80% reduction in context switching between platforms
- 50% increase in task tracking compliance
- 30% reduction in project status meeting time
- Improved visibility of team workload and capacity

## 2. Technical Architecture

### 2.1 Linear API Integration
- **Authentication**: OAuth 2.0 implementation for secure API access
- **GraphQL Client**: Apollo Client for querying Linear's GraphQL API
- **Caching Strategy**: Client-side caching with selective invalidation
- **Synchronization**: Bidirectional data flow between Linear and PeopleOS
- **Rate Limiting**: Respect Linear API rate limits with queuing mechanism

### 2.2 Authentication & Authorization
```typescript
interface LinearAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

interface LinearTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}
```

### 2.3 Data Models

#### 2.3.1 Linear Workspace Connection
```typescript
interface ILinearWorkspace {
  _id: string;
  name: string;
  linearId: string;
  teams: ILinearTeam[];
  integrationStatus: 'active' | 'paused' | 'disconnected';
  lastSyncedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2.3.2 Linear Team Integration
```typescript
interface ILinearTeam {
  _id: string;
  name: string;
  linearId: string;
  workspaceId: string;
  description?: string;
  key: string;
  members: {
    personnelId: string;
    linearUserId: string;
    role: 'admin' | 'member' | 'guest';
  }[];
  projects: string[]; // References to IProject
  lastSyncedAt: Date;
}
```

#### 2.3.3 Linear Project Mapping
```typescript
interface IProjectLinearMapping {
  _id: string;
  projectId: string; // PeopleOS project ID
  linearProjectId: string;
  linearTeamId: string;
  cycleIds: string[]; // Linear cycle IDs
  syncConfig: {
    syncMilestones: boolean;
    syncComments: boolean;
    syncAttachments: boolean;
    syncStatus: boolean;
  };
  lastSyncedAt: Date;
}
```

#### 2.3.4 Linear Task Mapping
```typescript
interface ITaskLinearMapping {
  _id: string;
  taskId: string; // PeopleOS task ID
  linearIssueId: string;
  linearIssueKey: string; // e.g., "ENG-123"
  syncStatus: 'synced' | 'pending_sync' | 'sync_failed';
  lastSyncedAt: Date;
  lastSyncError?: string;
}
```

## 3. Core Features

### 3.1 Workspace & Team Configuration

#### 3.1.1 Linear Account Connection
- OAuth flow for connecting Linear organization to PeopleOS
- Workspace settings configuration panel
- Team mapping between Linear teams and PeopleOS departments
- Access control and permission management

#### 3.1.2 Team Mapping UI Component
```typescript
interface TeamMappingProps {
  departments: IDepartment[];
  linearTeams: LinearTeamData[];
  existingMappings: ILinearTeam[];
  onSaveMapping: (mappings: TeamMapping[]) => Promise<void>;
}

const TeamMappingConfiguration = ({
  departments,
  linearTeams,
  existingMappings,
  onSaveMapping
}: TeamMappingProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Map Linear Teams to Departments</h2>
      
      {departments.map(dept => (
        <TeamMappingCard 
          key={dept._id}
          department={dept}
          availableTeams={linearTeams}
          currentMapping={existingMappings.find(m => 
            m.members.some(member => 
              personnel.find(p => p._id === member.personnelId)?.department === dept._id
            )
          )}
          onUpdateMapping={(linearTeamId) => handleUpdateMapping(dept._id, linearTeamId)}
        />
      ))}
      
      <Button 
        variant="primary" 
        onClick={() => onSaveMapping(mappings)}
        disabled={!isMappingValid}
      >
        Save Team Configuration
      </Button>
    </div>
  );
};
```

### 3.2 Project Synchronization

#### 3.2.1 Project Linking
- Two-way project creation between systems
- Project metadata synchronization (name, description, status)
- Project timeline and milestone mapping
- Team assignment synchronization

#### 3.2.2 Linear Project Creation from PeopleOS
```typescript
async function createLinearProject(peopleOSProject: IProject): Promise<string> {
  const { linearClient } = useLinearClient();
  
  // Get the team ID for this project's department
  const teamMapping = await getTeamMappingForDepartment(peopleOSProject.department);
  
  if (!teamMapping) {
    throw new Error("No Linear team mapping exists for this department");
  }
  
  // Create project in Linear
  const { data, error } = await linearClient.createProject({
    teamId: teamMapping.linearTeamId,
    name: peopleOSProject.name,
    description: peopleOSProject.description,
    state: mapProjectStatusToLinear(peopleOSProject.status),
    startDate: peopleOSProject.startDate,
    targetDate: peopleOSProject.endDate,
  });
  
  if (error) {
    throw new Error(`Failed to create Linear project: ${error.message}`);
  }
  
  // Store the mapping
  await createProjectMapping({
    projectId: peopleOSProject._id,
    linearProjectId: data.project.id,
    linearTeamId: teamMapping.linearTeamId,
    syncConfig: {
      syncMilestones: true,
      syncComments: true,
      syncAttachments: true,
      syncStatus: true,
    }
  });
  
  return data.project.id;
}
```

### 3.3 Task Management Integration

#### 3.3.1 Task Synchronization
- Bi-directional task creation and updates
- Status synchronization with customizable workflow mapping
- Assignment and reassignment of tasks
- Priority and deadline synchronization

#### 3.3.2 Linear Issue Widget
```typescript
interface LinearIssueWidgetProps {
  task: ITask;
  linearMapping?: ITaskLinearMapping;
}

const LinearIssueWidget = ({ task, linearMapping }: LinearIssueWidgetProps) => {
  const { isLoading, issue } = useLinearIssue(linearMapping?.linearIssueId);
  
  if (isLoading) {
    return <LinearIssueSkeleton />;
  }
  
  if (!linearMapping) {
    return (
      <div className="p-4 border border-dashed border-gray-300 rounded-lg">
        <p className="text-sm text-gray-500">Not linked to Linear</p>
        <Button size="sm" onClick={() => handleCreateLinearIssue(task)}>
          Create in Linear
        </Button>
      </div>
    );
  }
  
  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <LinearLogo size={16} />
          <span className="font-mono text-sm font-medium">{linearMapping.linearIssueKey}</span>
        </div>
        <LinearIssueStatus status={issue.state} />
      </div>
      
      <div className="mt-2">
        <h4 className="font-medium">{issue.title}</h4>
        <p className="text-sm text-gray-600 mt-1">{truncate(issue.description, 100)}</p>
      </div>
      
      <div className="mt-3 flex items-center justify-between">
        <LinearIssuePriority priority={issue.priority} />
        <LinearIssueAssignee assigneeId={issue.assignee?.id} />
      </div>
      
      <Button 
        variant="outline"
        size="sm"
        className="mt-3 w-full"
        onClick={() => window.open(issue.url, '_blank')}
      >
        Open in Linear
      </Button>
    </div>
  );
};
```

### 3.4 Triage & Workflow Automation

#### 3.4.1 Linear Triage Integration
- Map Linear Triage to PeopleOS support workflows
- Automated issue creation from support tickets
- Slack integration for request handling
- SLA tracking and notification system

#### 3.4.2 Linear Asks Integration
- Configure Linear Asks Slack app connection
- Map request types to teams/departments
- Customize forms for different request categories
- Set up approval workflows for resource requests

### 3.5 Reporting & Analytics

#### 3.5.1 Linear Insights in PeopleOS
- Project velocity metrics from Linear
- Cycle time analysis and team performance
- Workload distribution and capacity planning
- Cross-project dependency visualization

#### 3.5.2 Combined Analytics Dashboard
```typescript
interface LinearAnalyticsProps {
  timeRange: 'week' | 'month' | 'quarter';
  teams: ILinearTeam[];
}

const LinearAnalyticsDashboard = ({ timeRange, teams }: LinearAnalyticsProps) => {
  const { isLoading, analytics } = useLinearAnalytics(teams.map(t => t.linearId), timeRange);
  
  if (isLoading) {
    return <AnalyticsSkeleton />;
  }
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-4 gap-4">
        <MetricCard 
          title="Completed Issues" 
          value={analytics.completedIssuesCount} 
          trend={analytics.completionTrend}
        />
        <MetricCard 
          title="Avg. Cycle Time" 
          value={analytics.avgCycleTime} 
          unit="days"
          trend={analytics.cycleTimeTrend}
        />
        <MetricCard 
          title="Active Issues" 
          value={analytics.activeIssuesCount}
        />
        <MetricCard 
          title="Team Capacity" 
          value={analytics.capacityUtilization}
          unit="%"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <VelocityChart data={analytics.velocityData} />
        <CycleTimeChart data={analytics.cycleTimeData} />
      </div>
      
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Team Performance</h3>
        <TeamPerformanceTable teams={teams} metrics={analytics.teamMetrics} />
      </div>
    </div>
  );
};
```

## 4. User Flows

### 4.1 Administrator Flows

#### 4.1.1 Initial Linear Integration Setup
1. Admin navigates to "Integrations" in PeopleOS settings
2. Selects Linear from available integrations
3. Authenticates with Linear via OAuth
4. Maps Linear teams to PeopleOS departments
5. Configures sync settings (frequency, conflict resolution, etc.)
6. Tests connection and verifies data flow
7. Enables integration for specific teams or organization-wide

#### 4.1.2 Project Configuration Flow
1. Admin creates new project in PeopleOS
2. Toggles Linear integration for the project
3. Selects appropriate Linear team
4. Configures which aspects to sync (tasks, comments, attachments)
5. Sets up status mapping between Linear and PeopleOS workflows
6. Configures notifications for sync events
7. Saves configuration and initiates initial sync

### 4.2 End User Flows

#### 4.2.1 Creating and Managing Tasks
1. User creates task in PeopleOS personnel dashboard
2. Task is automatically created in Linear with appropriate metadata
3. User can view and interact with Linear issue within PeopleOS
4. Status updates in either system sync bidirectionally
5. Comments and attachments sync between platforms
6. Task completion in either system marks it complete in both

#### 4.2.2 Linear Issue Creation Flow
1. User identifies need for new task
2. Creates issue in PeopleOS or directly in Linear
3. If created in Linear, issue appears in PeopleOS within sync interval
4. User assigns issue to team member
5. Sets priority, deadline, and attaches relevant documents
6. Updates are reflected in both systems automatically

## 5. API Implementation

### 5.1 GraphQL Schema for Linear API

```graphql
# Key GraphQL queries and mutations we'll implement
query GetLinearTeams {
  teams {
    id
    name
    key
    description
    members {
      id
      name
      email
    }
  }
}

query GetLinearProjects($teamId: ID!) {
  team(id: $teamId) {
    projects {
      id
      name
      description
      state
      startDate
      targetDate
      issues {
        id
        title
      }
    }
  }
}

mutation CreateLinearIssue($input: IssueCreateInput!) {
  issueCreate(input: $input) {
    success
    issue {
      id
      title
      identifier
      url
    }
  }
}

subscription IssueUpdated {
  issueUpdated {
    id
    title
    state
    priority
    assignee {
      id
      name
    }
  }
}
```

### 5.2 API Client Implementation

```typescript
export class LinearApiClient {
  private client: ApolloClient<NormalizedCacheObject>;
  
  constructor(accessToken: string) {
    this.client = new ApolloClient({
      uri: 'https://api.linear.app/graphql',
      cache: new InMemoryCache(),
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });
  }
  
  async getTeams(): Promise<LinearTeam[]> {
    const { data } = await this.client.query({
      query: GET_LINEAR_TEAMS,
    });
    
    return data.teams;
  }
  
  async getProjects(teamId: string): Promise<LinearProject[]> {
    const { data } = await this.client.query({
      query: GET_LINEAR_PROJECTS,
      variables: { teamId },
    });
    
    return data.team.projects;
  }
  
  async createIssue(input: LinearIssueInput): Promise<LinearIssue> {
    const { data } = await this.client.mutate({
      mutation: CREATE_LINEAR_ISSUE,
      variables: { input },
    });
    
    return data.issueCreate.issue;
  }
  
  async updateIssue(id: string, input: Partial<LinearIssueInput>): Promise<LinearIssue> {
    const { data } = await this.client.mutate({
      mutation: UPDATE_LINEAR_ISSUE,
      variables: { id, input },
    });
    
    return data.issueUpdate.issue;
  }
  
  // ... additional methods for other Linear API operations
}
```

## 6. User Interface Components

### 6.1 Linear Integration Settings

Provide a dedicated settings page in the PeopleOS admin dashboard for managing Linear integration:

- Connection status indicator
- API token management
- Team mapping configuration
- Sync frequency settings
- Error log and troubleshooting tools
- Test connection functionality

### 6.2 Linear Issue Components

Create a set of reusable components for displaying Linear issues within PeopleOS:

- Linear issue card with status, priority, and assignee
- Linear issue detail modal with full issue information
- Linear issue creation form
- Status transition buttons mapped to Linear workflows
- Linear comment thread integration

### 6.3 Project Dashboard Enhancements

Enhance the existing project dashboard with Linear-specific features:

- Linear project metrics widget
- Linear cycle planning integration
- Linear roadmap visualization
- Linear issue filtering and search

## 7. Security & Compliance

### 7.1 Data Security

- Linear API tokens stored using secure credential management
- Encryption of all Linear data at rest
- Regular token rotation and audit logging
- Permission syncing between PeopleOS and Linear

### 7.2 User Permission Management

- Map Linear roles to PeopleOS permission system
- Ensure users only access Linear data they have permission to view
- Audit logs for all Linear API operations
- Granular control over which teams can use Linear integration

## 8. Implementation Phases

### Phase 1: Basic Integration (2 weeks)
- Linear authentication and API setup
- Team and department mapping
- Basic issue synchronization (create, update, delete)
- Initial UI components for Linear issues

### Phase 2: Enhanced Project Management (2 weeks)
- Project creation and synchronization
- Timeline and milestone mapping
- Advanced issue management
- Comments and attachment synchronization

### Phase 3: Workflow Automation (2 weeks)
- Linear Triage integration
- Slack integration via Linear Asks
- Custom workflow mapping
- Automated status transitions

### Phase 4: Analytics & Reporting (2 weeks)
- Linear insights integration
- Performance metrics dashboard
- Team velocity and capacity planning
- Cross-project dependency visualization

## 9. Rollout Strategy

### 9.1 Beta Testing
- Identify 2-3 teams for beta testing
- Provide training and documentation
- Collect feedback on UX and functionality
- Iterate based on beta user feedback

### 9.2 Full Deployment
- Roll out to all teams in phases
- Provide training sessions and documentation
- Monitor system performance and sync issues
- Gather feedback for continuous improvement

## 10. Success Metrics & KPIs

### 10.1 User Adoption
- Percentage of eligible users connecting Linear accounts
- Number of tasks created/managed through integration
- Reduction in context switching between platforms

### 10.2 Efficiency Metrics
- Time saved on project management tasks
- Improved visibility of team workload
- Reduction in status update meetings
- Faster issue resolution times

## 11. Maintenance & Support

### 11.1 Monitoring & Alerting
- API health checks and error monitoring
- Sync failure notifications
- Rate limit tracking and optimization
- Performance monitoring for API calls

### 11.2 Troubleshooting Tools
- Sync log viewer for administrators
- Manual sync triggers for individual items
- Connection diagnostics tools
- Data reconciliation utilities

## 12. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Linear API changes | High | Medium | Monitor Linear API updates, maintain version compatibility |
| Rate limiting | Medium | High | Implement backoff strategies, optimize sync frequency |
| Data conflicts | Medium | Medium | Clear conflict resolution policies, manual override options |
| User resistance | Medium | Low | Provide training, highlight benefits, gather user feedback |
| Authentication failures | High | Low | Robust token refresh, clear error messaging, fallback modes |

## 13. Documentation & Training

### 13.1 Technical Documentation
- API integration details
- Data model mapping
- Troubleshooting guides
- Configuration options

### 13.2 User Documentation
- Setup guides for administrators
- Quick start guide for end users
- Video tutorials for common workflows
- FAQ and best practices

## 14. Project Dashboard Implementation Plan

### 14.1 Overview & Objectives

The Project Dashboard will serve as a centralized command center for managing all projects across the organization with deep Linear integration. This implementation builds upon our existing Management Dashboard architecture while adding Linear-specific features and functionality.

**Key Objectives:**
- Provide a comprehensive view of all projects with real-time Linear data
- Enable seamless project creation, management, and tracking between PeopleOS and Linear
- Visualize project timelines, milestones, and dependencies with Linear cycle integration
- Facilitate team collaboration through integrated comments and activity feeds
- Surface key metrics and analytics from Linear for data-driven decision making

### 14.2 Architecture & Technical Approach

#### 14.2.1 Component Structure

The Project Dashboard will follow our established modular architecture pattern:

```
src/
├── components/
│   ├── management/
│   │   ├── modules/
│   │   │   ├── ProjectManagement.tsx        # Main project management module
│   │   │   └── ProjectDetails.tsx           # Detailed project view component
│   ├── projects/
│   │   ├── linear/
│   │   │   ├── LinearProjectCard.tsx        # Linear project display component
│   │   │   ├── LinearIssueList.tsx          # Display Linear issues for a project
│   │   │   ├── LinearCycleSelector.tsx      # Component to select/view Linear cycles
│   │   │   └── LinearMetricsWidget.tsx      # Analytics widget with Linear metrics
│   │   ├── ProjectCard.tsx                  # Core project card component
│   │   ├── ProjectForm.tsx                  # Project creation/editing form
│   │   ├── ProjectTimeline.tsx              # Timeline visualization
│   │   └── ProjectFilters.tsx               # Filtering and search interface
├── lib/
│   ├── hooks/
│   │   ├── useProjectManagement.ts          # Project data and operations hook
│   │   ├── useLinearProjects.ts             # Linear project data and operations
│   │   └── useLinearSync.ts                 # Linear data synchronization hook
│   ├── linear/
│   │   ├── client.ts                        # Linear API client implementation
│   │   ├── mutations.ts                     # GraphQL mutations for Linear
│   │   └── queries.ts                       # GraphQL queries for Linear
│   └── api/
│       └── projects.ts                      # Project API endpoint handlers
```

#### 14.2.2 Data Flow

1. **Initial Load**:
   - Fetch projects from PeopleOS database
   - For Linear-connected projects, fetch corresponding Linear project data
   - Combine data sources for unified view

2. **Synchronization**:
   - Real-time updates using Linear webhooks
   - Scheduled background sync for consistency
   - Event-driven updates when changes occur in either system

3. **Linear API Usage**:
   - Use GraphQL batching to minimize API calls
   - Implement caching strategy to reduce redundant requests
   - Handle rate limiting with exponential backoff

### 14.3 Feature Implementation Details

#### 14.3.1 Project Dashboard Module

**Core Components:**
- Project list view with filtering and sorting
- Project creation form with Linear integration options
- Dashboard metrics showing project status distribution
- Department and team filtering options

**Implementation:**
```tsx
// ProjectManagement.tsx (simplified)
export default function ProjectManagement() {
  const {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject
  } = useProjectManagement();
  
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLinearFiltered, setIsLinearFiltered] = useState(false);

  // Filter projects based on filters
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesDepartment = selectedDepartment === 'all' || project.departmentId === selectedDepartment;
      const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
      const matchesSearch = !searchTerm || project.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLinear = !isLinearFiltered || project.linearProjectId;
      
      return matchesDepartment && matchesStatus && matchesSearch && matchesLinear;
    });
  }, [projects, selectedDepartment, selectedStatus, searchTerm, isLinearFiltered]);

  // Render project grid, stats, filters, etc.
  return (
    <div className="space-y-6">
      {/* Project Statistics */}
      <ProjectStats projects={projects} />
      
      {/* Filters and Actions */}
      <ProjectFilters 
        departments={departments}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={setSelectedDepartment}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isLinearFiltered={isLinearFiltered}
        onLinearFilterChange={setIsLinearFiltered}
        onCreateProject={handleCreateProject}
      />
      
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
    </div>
  );
}
```

#### 14.3.2 Linear Project Integration

**Project Creation with Linear:**
```tsx
// Project form with Linear integration options
function ProjectLinearIntegration({ departments }) {
  const { linearTeams, loading } = useLinearTeams();
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [enableLinear, setEnableLinear] = useState(false);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          checked={enableLinear}
          onCheckedChange={setEnableLinear}
          id="linear-integration"
        />
        <Label htmlFor="linear-integration">
          Create project in Linear
        </Label>
      </div>
      
      {enableLinear && (
        <div className="space-y-4 pl-6 border-l-2 border-blue-200">
          <FormField
            label="Linear Team"
            description="Select which Linear team this project belongs to"
          >
            <Select
              disabled={loading}
              value={selectedTeam}
              onValueChange={setSelectedTeam}
              placeholder="Select a team"
            >
              {linearTeams.map(team => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </Select>
          </FormField>
          
          <FormField
            label="Sync Configuration"
          >
            <div className="space-y-2">
              <Checkbox id="sync-issues" defaultChecked />
              <Label htmlFor="sync-issues">Sync issues</Label>
              
              <Checkbox id="sync-milestones" defaultChecked />
              <Label htmlFor="sync-milestones">Sync milestones</Label>
              
              <Checkbox id="sync-comments" defaultChecked />
              <Label htmlFor="sync-comments">Sync comments</Label>
            </div>
          </FormField>
        </div>
      )}
    </div>
  );
}
```

#### 14.3.3 Project Detail View with Linear Data

The project detail view will provide comprehensive information about a project, including its Linear connection:

```tsx
// ProjectDetails.tsx (simplified)
export default function ProjectDetails({ projectId }) {
  const { project, loading } = useProject(projectId);
  const { linearProject, linearIssues, isLinearLoading } = useLinearProject(project?.linearProjectId);
  const [activeTab, setActiveTab] = useState('overview');
  
  if (loading) {
    return <LoadingPlaceholder />;
  }
  
  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-slate-400">{project.description}</p>
        </div>
        
        {project.linearProjectId && (
          <Badge className="flex items-center gap-2">
            <LinearLogo size={16} />
            <span>Linear Connected</span>
          </Badge>
        )}
      </div>
      
      {/* Project Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          {project.linearProjectId && (
            <TabsTrigger value="linear">Linear</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="overview">
          <ProjectOverview project={project} />
        </TabsContent>
        
        <TabsContent value="tasks">
          <ProjectTasks projectId={projectId} />
        </TabsContent>
        
        <TabsContent value="milestones">
          <ProjectMilestones projectId={projectId} />
        </TabsContent>
        
        <TabsContent value="team">
          <ProjectTeam projectId={projectId} />
        </TabsContent>
        
        {project.linearProjectId && (
          <TabsContent value="linear">
            <LinearProjectView 
              linearProjectId={project.linearProjectId} 
              linearProject={linearProject}
              linearIssues={linearIssues}
              isLoading={isLinearLoading}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
```

#### 14.3.4 Linear Project View Component

```tsx
function LinearProjectView({ linearProjectId, linearProject, linearIssues, isLoading }) {
  const [cycleFilter, setCycleFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  if (isLoading) {
    return <LoadingPlaceholder />;
  }
  
  return (
    <div className="space-y-6">
      {/* Linear Project Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Total Issues"
          value={linearIssues.length}
          icon={<ClipboardList size={18} />}
        />
        <MetricCard
          title="Open Issues"
          value={linearIssues.filter(i => i.state !== 'completed').length}
          icon={<Circle size={18} />}
        />
        <MetricCard
          title="Completed Issues"
          value={linearIssues.filter(i => i.state === 'completed').length}
          icon={<CheckCircle size={18} />}
        />
        <MetricCard
          title="Current Cycle"
          value={linearProject.activeCycle?.name || 'None'}
          icon={<Repeat size={18} />}
        />
      </div>
      
      {/* Linear Cycles */}
      {linearProject.cycles?.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-3">Cycles</h3>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <Button 
              variant={cycleFilter === null ? "secondary" : "outline"}
              size="sm"
              onClick={() => setCycleFilter(null)}
            >
              All Cycles
            </Button>
            {linearProject.cycles.map(cycle => (
              <Button
                key={cycle.id}
                variant={cycleFilter === cycle.id ? "secondary" : "outline"}
                size="sm"
                onClick={() => setCycleFilter(cycle.id)}
              >
                {cycle.name}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* Linear Issues */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Issues</h3>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
            placeholder="Filter by status"
          >
            <SelectItem value={null}>All Statuses</SelectItem>
            {linearProject.workflowStates.map(state => (
              <SelectItem key={state.id} value={state.id}>
                {state.name}
              </SelectItem>
            ))}
          </Select>
        </div>
        
        <LinearIssueList
          issues={linearIssues.filter(issue => {
            const matchesCycle = !cycleFilter || issue.cycle?.id === cycleFilter;
            const matchesStatus = !statusFilter || issue.state === statusFilter;
            return matchesCycle && matchesStatus;
          })}
          onIssueClick={(issueId) => window.open(`https://linear.app/issue/${issueId}`, '_blank')}
        />
      </div>
    </div>
  );
}
```

### 14.4 Integration Hooks Implementation

#### 14.4.1 useLinearProjects Hook

```typescript
// useLinearProjects.ts
export function useLinearProjects(teamId?: string) {
  const [projects, setProjects] = useState<LinearProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (!teamId) {
      setProjects([]);
      setLoading(false);
      return;
    }
    
    async function fetchProjects() {
      try {
        setLoading(true);
        const linearClient = getLinearClient();
        const projects = await linearClient.getProjects(teamId);
        setProjects(projects);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch Linear projects'));
        console.error('Error fetching Linear projects:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProjects();
  }, [teamId]);
  
  return { projects, loading, error };
}
```

#### 14.4.2 useLinearSync Hook

```typescript
// useLinearSync.ts
export function useLinearSync(projectId: string, linearProjectId: string) {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  
  const syncProject = async () => {
    try {
      setSyncStatus('syncing');
      
      // Call API to sync project data with Linear
      const response = await fetch(`/api/projects/${projectId}/sync-linear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ linearProjectId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync with Linear');
      }
      
      const data = await response.json();
      setLastSynced(new Date());
      setSyncStatus('idle');
      
      return data;
    } catch (err) {
      console.error('Linear sync error:', err);
      setSyncStatus('error');
      throw err;
    }
  };
  
  return {
    syncStatus,
    lastSynced,
    syncProject,
  };
}
```

### 14.5 Timeline & Roadmap

#### 14.5.1 Implementation Phases

**Phase 1 (Week 1-2): Core Project Management**
- Project dashboard module integration into Management Dashboard
- Basic project CRUD operations
- Department and team mapping
- Project filtering and search functionality

**Phase 2 (Week 3-4): Linear Integration Foundations**
- Linear project connection UI
- Linear team mapping
- Project creation in Linear
- Basic data synchronization

**Phase 3 (Week 5-6): Enhanced Project Features**
- Project detail view with Linear data
- Issue management and synchronization
- Milestone and cycle integration
- Timeline visualization

**Phase 4 (Week 7-8): Analytics & Refinement**
- Linear metrics integration
- Project progress visualization
- Performance analytics
- User feedback incorporation and refinement

#### 14.5.2 Key Milestones

1. **Project Dashboard MVP** - End of Week 2
   - Basic project management without Linear integration
   - Project creation, editing, and filtering
   
2. **Linear Connection** - End of Week 4
   - Linear project linking
   - Two-way project creation
   - Basic synchronization
   
3. **Complete Integration** - End of Week 6
   - Full project detail view with Linear data
   - Issue and milestone synchronization
   - Timeline visualization
   
4. **Final Release** - End of Week 8
   - Analytics dashboard
   - Performance optimizations
   - User feedback incorporated

### 14.6 User Experience Considerations

#### 14.6.1 Linear Connection UX

- Clearly indicate which projects are connected to Linear
- Provide clear error messaging when synchronization fails
- Show sync status and last sync time
- Offer manual sync options for immediate updates

#### 14.6.2 Project Status Visualization

- Use consistent color coding for project statuses
- Provide visual indicators of Linear project health
- Display progress metrics in an intuitive dashboard
- Show project timeline with milestones from Linear

#### 14.6.3 Mockups & Wireframes

_[Include wireframes of key screens here]_

### 14.7 Testing Strategy

#### 14.7.1 Unit Testing

- Test all Linear API interaction methods
- Verify correct data mapping between systems
- Test synchronization logic
- Validate error handling

#### 14.7.2 Integration Testing

- Test end-to-end project creation flow
- Verify bidirectional updates
- Test authentication and connection
- Validate webhook processing

#### 14.7.3 User Acceptance Testing

- Select pilot group from different departments
- Provide test scenarios for common workflows
- Collect feedback through structured forms
- Iterate based on user feedback

### 14.8 Technical Constraints & Considerations

- Linear API rate limits (max 200 requests per minute)
- GraphQL query complexity limitations
- Real-time updates via webhooks require public endpoint
- Authentication token security and renewal
- Data consistency during synchronization failures

### 14.9 Success Criteria

- 80% of project managers using the integrated dashboard
- 60% reduction in time spent updating project status
- 95% sync reliability between systems
- Positive user satisfaction rating (>4/5 in post-implementation survey)
- Measurable increase in project visibility across departments

---

**Last Updated**: July 2024  
**Author**: [Product Team]  
**Status**: Draft 