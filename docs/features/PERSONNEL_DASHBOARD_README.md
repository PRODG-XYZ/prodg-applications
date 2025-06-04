# Personnel Dashboard Implementation

A comprehensive personnel management system built with Next.js 15, React 19, and MongoDB. This implementation transforms the recruitment platform into a complete employee lifecycle management system.

## 🚀 Features Implemented

### Phase 1: Core Infrastructure & Onboarding ✅
- **Personnel Data Models**: Complete personnel, project, task, and time entry schemas
- **Role-Based Authentication**: Multi-level permission system (employee, senior, lead, manager, director)
- **Onboarding Workflow**: Digital onboarding with task tracking and completion percentage
- **Profile Management**: Comprehensive user profiles with skills, certifications, and preferences

### Phase 2: Project & Task Management ✅
- **Project Management**: Create and manage projects with team assignments
- **Task Tracking**: Kanban-style task management with status tracking
- **Team Collaboration**: Project-based team organization
- **Performance Metrics**: Real-time productivity and performance tracking

### Phase 3: Dashboard & Analytics ✅
- **Interactive Dashboard**: Modern, responsive dashboard with real-time data
- **Performance Metrics**: Task completion, hours logged, productivity scores
- **Activity Tracking**: Recent activity feed with project and task updates
- **Time Management**: Time tracking with approval workflows

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15 with React 19
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Role-based session management
- **UI**: Tailwind CSS with Framer Motion animations
- **State Management**: React hooks with context

### Database Schema

#### Personnel Collection
```typescript
interface IPersonnel {
  _id: string;
  applicationId: string;
  employeeId: string;
  email: string;
  name: string;
  role: 'employee' | 'senior' | 'lead' | 'manager' | 'director';
  department: string;
  startDate: Date;
  manager?: string;
  directReports: string[];
  status: 'onboarding' | 'active' | 'on_leave' | 'terminated';
  profile: {
    avatar?: string;
    bio?: string;
    skills: string[];
    certifications: string[];
    socialLinks: object;
  };
  preferences: object;
  onboarding: object;
}
```

#### Project Collection
```typescript
interface IProject {
  _id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  team: {
    lead: string;
    members: string[];
    stakeholders: string[];
  };
  tasks: string[];
  // ... additional fields
}
```

#### Task Collection
```typescript
interface ITask {
  _id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  reporter: string;
  comments: object[];
  // ... additional fields
}
```

#### TimeEntry Collection
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
}
```

## 🔐 Role-Based Permissions

### Permission Matrix
| Role | Create Projects | Assign Tasks | View All Projects | Approve Timesheets | Access Analytics | Manage Team |
|------|----------------|--------------|-------------------|-------------------|------------------|-------------|
| Employee | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Senior | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Lead | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manager | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Director | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## 📁 File Structure

```
src/
├── app/
│   ├── personnel/
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Main dashboard page
│   │   ├── login/
│   │   │   └── page.tsx              # Personnel login
│   │   └── layout.tsx                # Personnel layout
│   └── api/
│       └── personnel/
│           ├── auth/
│           │   └── route.ts          # Authentication API
│           └── dashboard/
│               └── route.ts          # Dashboard data API
├── components/
│   └── personnel/
│       └── PersonnelDashboard.tsx    # Main dashboard component
├── lib/
│   ├── models/
│   │   ├── Personnel.ts              # Personnel data model
│   │   ├── Project.ts                # Project data model
│   │   ├── Task.ts                   # Task data model
│   │   └── TimeEntry.ts              # Time tracking model
│   └── personnel/
│       ├── auth.ts                   # Authentication utilities
│       └── dashboard.ts              # Dashboard data utilities
└── scripts/
    └── seed-personnel.ts             # Database seeding script
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)
- npm or pnpm

### Installation

1. **Clone and install dependencies**:
```bash
git clone <repository>
cd prodg-applications
npm install
```

2. **Set up environment variables**:
```bash
# Create .env.local file
echo "MONGODB_URI=mongodb://localhost:27017/prodg-applications" > .env.local
```

3. **Seed the database with sample data**:
```bash
MONGODB_URI=mongodb://localhost:27017/prodg-applications npm run seed-personnel
```

4. **Start the development server**:
```bash
npm run dev
```

5. **Access the Personnel Dashboard**:
- Navigate to `http://localhost:3000/personnel/login`
- Use any of the sample credentials (see below)

### Sample Login Credentials

The seeding script creates three sample personnel accounts:

| Email | Role | Department | Features |
|-------|------|------------|----------|
| `john.doe@company.com` | Lead | Engineering | Full permissions, project management |
| `jane.smith@company.com` | Senior | Engineering | Task assignment, analytics access |
| `mike.johnson@company.com` | Employee | Engineering | Basic access, onboarding status |

**Password**: Any password (authentication is simplified for demo)

## 🎯 Dashboard Features

### Overview Section
- **Welcome Header**: Personalized greeting with role and department
- **Metrics Cards**: 
  - Tasks Completed (last 30 days)
  - Hours Logged (last 30 days)
  - Projects Contributed
  - Productivity Score (calculated metric)
- **Active Tasks**: Current task assignments with status
- **Active Projects**: Project participation with team info
- **Recent Activity**: Timeline of recent actions

### Performance Metrics
- **Task Completion Rate**: Tracks completed vs assigned tasks
- **Time Logging**: Hours tracked across projects and tasks
- **Team Collaboration**: Interaction score based on comments and participation
- **Productivity Score**: Composite metric combining multiple factors

### Navigation Sections
- **Overview**: Main dashboard with key metrics
- **Projects**: Project management interface (coming soon)
- **Tasks**: Task board with Kanban view (coming soon)
- **Team**: Team directory and collaboration tools (coming soon)

## 🔧 API Endpoints

### Authentication
```typescript
POST /api/personnel/auth
Body: { email, password, action: 'login' | 'logout' }
```

### Dashboard Data
```typescript
GET /api/personnel/dashboard
Headers: { Cookie: 'personnel-session=...' }
Response: {
  personnel: IPersonnel,
  projects: IProject[],
  tasks: ITask[],
  metrics: PerformanceMetrics,
  recentActivity: Activity[]
}
```

## 🎨 UI/UX Features

### Design System
- **Dark Theme**: Modern dark UI with glassmorphism effects
- **Responsive Design**: Mobile-first approach with breakpoints
- **Animations**: Smooth transitions with Framer Motion
- **Accessibility**: ARIA labels and keyboard navigation

### Interactive Elements
- **Metric Cards**: Animated cards with icons and color coding
- **Status Badges**: Color-coded status indicators
- **Activity Feed**: Real-time activity timeline
- **Navigation Tabs**: Smooth tab switching with active states

## 📊 Performance Considerations

### Database Optimization
- **Indexes**: Strategic indexing on frequently queried fields
- **Aggregation**: Efficient data aggregation for metrics
- **Caching**: Session-based caching for user data

### Frontend Optimization
- **Code Splitting**: Route-based code splitting
- **Lazy Loading**: Component lazy loading for better performance
- **Memoization**: React.memo and useMemo for expensive operations

## 🔮 Future Enhancements

### Phase 4: Advanced Features (Planned)
- **Real-time Collaboration**: WebSocket integration for live updates
- **Advanced Analytics**: Detailed reporting and insights
- **Calendar Integration**: Meeting and deadline management
- **File Management**: Document sharing and version control
- **Mobile App**: React Native mobile application
- **Notification System**: Email and push notifications

### Additional Features
- **Learning Management**: Training modules and skill development
- **Performance Reviews**: Structured review processes
- **Goal Setting**: OKR and KPI management
- **Time Tracking**: Advanced time tracking with approval workflows

## 🧪 Testing

### Sample Data
The seeding script creates:
- 3 Personnel records with different roles
- 3 Projects with varying statuses and priorities
- 4 Tasks across different projects
- 4 Time entries with different types

### Test Scenarios
1. **Login Flow**: Test authentication with different roles
2. **Dashboard Loading**: Verify data fetching and display
3. **Metrics Calculation**: Validate performance metric calculations
4. **Role Permissions**: Test permission-based feature access

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
```bash
# Ensure MongoDB is running
brew services start mongodb-community
# Or start manually
mongod --config /usr/local/etc/mongod.conf
```

2. **Environment Variables**:
```bash
# Check if .env.local exists and contains MONGODB_URI
cat .env.local
```

3. **Seeding Errors**:
```bash
# Run with explicit environment variable
MONGODB_URI=mongodb://localhost:27017/prodg-applications npm run seed-personnel
```

4. **Authentication Issues**:
- Clear browser cookies
- Check session expiration (24 hours)
- Verify personnel record exists in database

## 📝 Development Notes

### Code Quality
- **TypeScript**: Full type safety with strict mode
- **ESLint**: Code linting with Next.js configuration
- **Error Handling**: Comprehensive error handling and logging

### Security Considerations
- **Session Management**: Secure cookie-based sessions
- **Input Validation**: Server-side validation for all inputs
- **Role Verification**: Permission checks on all protected routes

## 🤝 Contributing

### Development Workflow
1. Create feature branch
2. Implement changes with tests
3. Update documentation
4. Submit pull request

### Code Standards
- Follow TypeScript best practices
- Use consistent naming conventions
- Add JSDoc comments for complex functions
- Maintain test coverage

---

## 📞 Support

For questions or issues:
1. Check the troubleshooting section
2. Review the API documentation
3. Check the sample data and test scenarios
4. Contact the development team

**Status**: ✅ Phase 1-3 Complete | 🚧 Phase 4 In Planning 