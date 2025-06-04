# Applicant Dashboard Implementation PRD
*Product Requirements Document for Applicant Dashboard Module*

## Overview
Implement a comprehensive applicant-facing dashboard that allows applicants to track their application status, manage their submissions, communicate with the team, and access personalized insights. This creates a transparent and engaging experience for applicants throughout the recruitment process.

## Technical Architecture

### Tech Stack Integration
- **Framework**: Next.js 15 with React 19
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Email-based magic link authentication
- **UI Components**: Existing UI library (Tailwind CSS + custom components)
- **Real-time Updates**: WebSocket or Server-Sent Events for status notifications
- **Email**: Nodemailer for notifications and magic links
- **State Management**: React hooks (useState, useEffect, useCallback)
- **API**: Next.js API routes

### Database Schema Extensions

#### New Applicant Session Collection
```typescript
interface IApplicantSession {
  _id: string;
  email: string;
  applicationId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  lastAccessedAt: Date;
}
```

#### New Communication Collection
```typescript
interface ICommunication {
  _id: string;
  applicationId: string;
  senderId: string; // email or 'system' or admin ID
  senderType: 'applicant' | 'admin' | 'system';
  message: string;
  attachments?: string[];
  timestamp: Date;
  isRead: boolean;
  messageType: 'message' | 'status_update' | 'request' | 'notification';
}
```

#### Application Model Enhancements
```typescript
// Add to existing IApplication interface
interface IApplication {
  // ... existing fields
  lastLoginAt?: Date;
  communicationEnabled: boolean;
  feedbackMessage?: string;
  reviewNotes?: string; // visible to applicant
  estimatedDecisionDate?: Date;
  applicantNotifications: {
    email: boolean;
    statusUpdates: boolean;
    messages: boolean;
  };
}
```

## Core Features

### 1. Authentication & Access

#### Magic Link Authentication
- **Email-based Login**: Send secure magic link to applicant's email
- **Session Management**: Secure token-based sessions with expiration
- **Application Linking**: Automatic linking to submitted application

#### Implementation
```typescript
// API Endpoint: POST /api/applicant/auth/request-access
// Body: { email: string, applicationId?: string }
// Returns: { success: boolean, message: string }

// API Endpoint: GET /api/applicant/auth/verify?token=<token>
// Returns: Redirect to dashboard with session cookie
```

### 2. Application Status Tracking

#### Status Timeline
- **Visual Timeline**: Step-by-step progress indicator
- **Status Descriptions**: Clear explanations for each status
- **Estimated Timelines**: Expected duration for each phase
- **Real-time Updates**: Live status change notifications

#### Status Stages
```typescript
type ApplicationStage = {
  status: 'submitted' | 'under_review' | 'technical_review' | 'interview_scheduled' | 'final_review' | 'decision_made';
  label: string;
  description: string;
  estimatedDuration: string;
  completedAt?: Date;
  isActive: boolean;
};
```

### 3. Application Management

#### View & Edit Application
- **Application Details**: Complete view of submitted information
- **Edit Capability**: Update application while status is 'pending'
- **Document Management**: Upload/replace resume and portfolio
- **Skill Updates**: Add/remove skills

#### Version History
```typescript
interface IApplicationVersion {
  _id: string;
  applicationId: string;
  version: number;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
    changedAt: Date;
  }[];
  createdAt: Date;
}
```

### 4. Communication Portal

#### Messaging System
- **Two-way Communication**: Chat with recruitment team
- **File Attachments**: Share additional documents
- **Message Categories**: General questions, technical queries, status inquiries
- **Real-time Notifications**: Instant message alerts

#### System Notifications
- **Status Updates**: Automated notifications for status changes
- **Deadline Reminders**: Interview scheduling, document requests
- **Process Updates**: General recruitment process updates

### 5. Personal Analytics

#### Application Insights
- **Submission Timeline**: Visual timeline of application journey
- **Response Time Analysis**: How quickly each stage progressed
- **Comparison Metrics**: Anonymous benchmarks vs other applicants
- **Skill Matching**: How skills align with role requirements

## File Structure

```
src/
├── app/
│   ├── applicant/
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # Main dashboard
│   │   │   ├── application/
│   │   │   │   ├── page.tsx          # Application details
│   │   │   │   └── edit/
│   │   │   │       └── page.tsx      # Edit application
│   │   │   ├── messages/
│   │   │   │   └── page.tsx          # Communication portal
│   │   │   └── insights/
│   │   │       └── page.tsx          # Personal analytics
│   │   ├── auth/
│   │   │   ├── request-access/
│   │   │   │   └── page.tsx          # Request access form
│   │   │   └── verify/
│   │   │       └── page.tsx          # Magic link verification
│   │   └── layout.tsx                # Applicant layout
│   └── api/
│       └── applicant/
│           ├── auth/
│           │   ├── request-access/
│           │   │   └── route.ts      # Magic link generation
│           │   └── verify/
│           │       └── route.ts      # Token verification
│           ├── application/
│           │   ├── route.ts          # Get/update application
│           │   └── versions/
│           │       └── route.ts      # Version history
│           ├── communications/
│           │   └── route.ts          # Messages API
│           ├── status/
│           │   └── route.ts          # Status tracking
│           └── insights/
│               └── route.ts          # Personal analytics
├── components/
│   └── applicant/
│       ├── ApplicantDashboard.tsx    # Main dashboard container
│       ├── StatusTimeline.tsx        # Application progress
│       ├── ApplicationDetails.tsx    # Application view/edit
│       ├── MessageCenter.tsx         # Communication interface
│       ├── DocumentManager.tsx       # File management
│       ├── InsightsDashboard.tsx     # Personal analytics
│       ├── NotificationBell.tsx      # Notification indicator
│       └── AuthGuard.tsx             # Authentication wrapper
├── lib/
│   ├── models/
│   │   ├── ApplicantSession.ts       # Session management
│   │   ├── Communication.ts          # Message system
│   │   └── ApplicationVersion.ts     # Version tracking
│   ├── applicant/
│   │   ├── auth.ts                   # Authentication utilities
│   │   ├── notifications.ts          # Notification system
│   │   └── analytics.ts              # Personal insights
│   └── hooks/
│       ├── useApplicantAuth.ts       # Authentication hook
│       ├── useApplicationStatus.ts   # Status tracking
│       └── useRealTimeMessages.ts    # Real-time messaging
```

## Implementation Phases

### Phase 1: Authentication & Basic Dashboard (Week 1)
1. Implement magic link authentication system
2. Create applicant session management
3. Build basic dashboard with application overview
4. Implement status timeline component

### Phase 2: Application Management (Week 2)
1. Application details view and edit functionality
2. Document upload/replacement system
3. Version history tracking
4. Input validation and form handling

### Phase 3: Communication System (Week 3)
1. Messaging interface and API
2. Real-time message notifications
3. File attachment system
4. Admin-applicant communication bridge

### Phase 4: Analytics & Polish (Week 4)
1. Personal insights dashboard
2. Email notification system
3. Real-time status updates
4. Mobile responsiveness and UX polish

## Core Components

### 1. ApplicantDashboard.tsx
```typescript
interface DashboardProps {
  application: IApplication;
  unreadMessages: number;
  recentActivity: Activity[];
}

const ApplicantDashboard = ({ application, unreadMessages, recentActivity }: DashboardProps) => {
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <StatusTimeline application={application} />
        <RecentActivity activities={recentActivity} />
      </div>
      <div>
        <QuickActions application={application} />
        <MessagePreview unreadCount={unreadMessages} />
      </div>
    </div>
  );
};
```

### 2. StatusTimeline.tsx
```typescript
interface StatusTimelineProps {
  application: IApplication;
}

const StatusTimeline = ({ application }: StatusTimelineProps) => {
  const stages = getApplicationStages(application);
  
  return (
    <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Application Progress</h2>
      <div className="space-y-4">
        {stages.map((stage, index) => (
          <StageItem 
            key={stage.status} 
            stage={stage} 
            isLast={index === stages.length - 1}
          />
        ))}
      </div>
    </div>
  );
};
```

### 3. MessageCenter.tsx
```typescript
interface MessageCenterProps {
  applicationId: string;
  messages: ICommunication[];
}

const MessageCenter = ({ applicationId, messages }: MessageCenterProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const sendMessage = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/applicant/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          message: newMessage,
          messageType: 'message'
        })
      });
      setNewMessage('');
      // Refresh messages
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-6">
      <MessageList messages={messages} />
      <MessageInput 
        value={newMessage}
        onChange={setNewMessage}
        onSend={sendMessage}
        isLoading={isLoading}
      />
    </div>
  );
};
```

## API Endpoints

### Authentication APIs
```typescript
// POST /api/applicant/auth/request-access
// Body: { email: string, applicationId?: string }
// Purpose: Send magic link to applicant

// GET /api/applicant/auth/verify?token=<token>
// Purpose: Verify magic link and create session

// POST /api/applicant/auth/logout
// Purpose: Clear applicant session
```

### Application APIs
```typescript
// GET /api/applicant/application
// Returns: Complete application data for authenticated applicant

// PATCH /api/applicant/application
// Body: Partial application updates
// Purpose: Update application (only if status allows)

// GET /api/applicant/application/versions
// Returns: Version history of application changes
```

### Communication APIs
```typescript
// GET /api/applicant/communications
// Returns: All messages for the application

// POST /api/applicant/communications
// Body: { message: string, messageType: string, attachments?: string[] }
// Purpose: Send message from applicant

// PATCH /api/applicant/communications/:id
// Body: { isRead: boolean }
// Purpose: Mark message as read
```

### Status & Analytics APIs
```typescript
// GET /api/applicant/status
// Returns: Current status and timeline information

// GET /api/applicant/insights
// Returns: Personal analytics and benchmarks
```

## Authentication Flow

### Magic Link Process
```typescript
// 1. Applicant requests access
POST /api/applicant/auth/request-access
{
  "email": "applicant@example.com",
  "applicationId": "optional_app_id"
}

// 2. System generates secure token and sends email
const token = generateSecureToken();
const magicLink = `${baseUrl}/applicant/auth/verify?token=${token}`;
await sendMagicLinkEmail(email, magicLink);

// 3. Applicant clicks link, system verifies and creates session
GET /api/applicant/auth/verify?token=<token>
// Sets secure HTTP-only cookie and redirects to dashboard
```

### Session Management
```typescript
interface ApplicantSession {
  email: string;
  applicationId: string;
  token: string;
  expiresAt: Date; // 7 days from creation
  lastAccessedAt: Date;
}

// Middleware for protected routes
const withApplicantAuth = (handler: NextApiHandler) => {
  return async (req: NextRequest, res: NextResponse) => {
    const token = req.cookies.get('applicant-session')?.value;
    if (!token || !await verifyApplicantSession(token)) {
      return NextResponse.redirect('/applicant/auth/request-access');
    }
    return handler(req, res);
  };
};
```

## Real-time Features

### Status Update Notifications
```typescript
// WebSocket connection for real-time updates
const useStatusUpdates = (applicationId: string) => {
  useEffect(() => {
    const ws = new WebSocket(`/api/applicant/ws?applicationId=${applicationId}`);
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      if (update.type === 'status_change') {
        // Update UI with new status
        setApplicationStatus(update.newStatus);
        showNotification(`Application status updated to: ${update.newStatus}`);
      }
    };
    
    return () => ws.close();
  }, [applicationId]);
};
```

### Message Notifications
```typescript
// Real-time message notifications
const useMessageNotifications = (applicationId: string) => {
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    const eventSource = new EventSource(`/api/applicant/communications/stream?applicationId=${applicationId}`);
    
    eventSource.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.senderType === 'admin') {
        setUnreadCount(prev => prev + 1);
        showNotification(`New message from recruitment team`);
      }
    };
    
    return () => eventSource.close();
  }, [applicationId]);
  
  return unreadCount;
};
```

## Email Templates

### Magic Link Email
```html
<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
  <h2>Access Your Application Dashboard</h2>
  <p>Click the link below to access your application dashboard:</p>
  <a href="{{magicLink}}" style="background: #06b6d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
    Access Dashboard
  </a>
  <p>This link will expire in 15 minutes for security.</p>
  <p>Application ID: {{applicationId}}</p>
</div>
```

### Status Update Email
```html
<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
  <h2>Application Status Update</h2>
  <p>Your application status has been updated to: <strong>{{newStatus}}</strong></p>
  <p>{{statusDescription}}</p>
  <a href="{{dashboardLink}}" style="background: #06b6d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
    View Dashboard
  </a>
</div>
```

## Security Considerations

### Authentication Security
- **Magic Link Expiration**: 15-minute expiration for security
- **Session Management**: 7-day session with sliding expiration
- **Token Security**: Cryptographically secure token generation
- **Rate Limiting**: Limit magic link requests per email

### Data Privacy
- **Application Data**: Only show applicant their own data
- **Message Privacy**: End-to-end message validation
- **Audit Logging**: Track all applicant actions for security

### Access Control
```typescript
// Middleware to ensure applicant can only access their own data
const validateApplicantAccess = async (req: NextRequest, applicationId: string) => {
  const session = await getApplicantSession(req);
  if (session.applicationId !== applicationId) {
    throw new Error('Unauthorized access');
  }
  return session;
};
```

## Performance Considerations

### Caching Strategy
- **Application Data**: Cache application details for 5 minutes
- **Message Cache**: Recent messages cached for 1 minute
- **Status Cache**: Status information cached for 2 minutes

### Database Optimization
```typescript
// Optimized queries for applicant dashboard
const getApplicantDashboardData = async (applicationId: string) => {
  const [application, messages, insights] = await Promise.all([
    Application.findById(applicationId).lean(),
    Communication.find({ applicationId }).sort({ timestamp: -1 }).limit(20).lean(),
    generatePersonalInsights(applicationId)
  ]);
  
  return { application, messages, insights };
};

// Indexes for performance
ApplicationSchema.index({ email: 1 });
CommunicationSchema.index({ applicationId: 1, timestamp: -1 });
ApplicantSessionSchema.index({ token: 1 });
ApplicantSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

## Dependencies to Add

```json
{
  "dependencies": {
    "nodemailer": "^6.9.0",
    "crypto": "^1.0.1",
    "ws": "^8.14.0",
    "react-query": "^3.39.0",
    "date-fns": "^3.6.0"
  },
  "devDependencies": {
    "@types/nodemailer": "^6.4.0",
    "@types/ws": "^8.5.0"
  }
}
```

## Error Handling

### Authentication Errors
```typescript
interface AuthError {
  code: 'INVALID_TOKEN' | 'EXPIRED_TOKEN' | 'EMAIL_NOT_FOUND' | 'SESSION_EXPIRED';
  message: string;
  redirectTo?: string;
}

const handleAuthError = (error: AuthError) => {
  switch (error.code) {
    case 'EXPIRED_TOKEN':
      return redirect('/applicant/auth/request-access?error=expired');
    case 'EMAIL_NOT_FOUND':
      return redirect('/applicant/auth/request-access?error=not_found');
    default:
      return redirect('/applicant/auth/request-access?error=general');
  }
};
```

## Testing Requirements

### Unit Tests
- Authentication flow (magic link generation/verification)
- Message sending and receiving
- Application update validation
- Personal analytics calculations

### Integration Tests
- End-to-end authentication process
- Real-time notification delivery
- Email template rendering
- API endpoint responses

### E2E Tests
- Complete applicant journey from access request to dashboard
- Message exchange between applicant and admin
- Application editing workflows
- Mobile responsiveness

## Monitoring & Analytics

### Applicant Engagement Metrics
- Dashboard visit frequency
- Feature usage (messages, application edits, document uploads)
- Time spent on platform
- Drop-off points in the process

### Performance Metrics
- Magic link delivery success rate
- Authentication success rate
- Real-time notification delivery time
- API response times

---

**Implementation Priority**: High
**Estimated Effort**: 4 weeks
**Dependencies**: Email service configuration (Nodemailer/SendGrid)
**Risk Level**: Medium (new authentication system) 