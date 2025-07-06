# Linear API Integration

This document provides a comprehensive guide to the Linear API integration implemented in PeopleOS.

## Overview

The Linear API integration enables seamless synchronization between PeopleOS and Linear, allowing teams to manage projects and tasks across both platforms. This integration supports bidirectional data flow, team mapping, and real-time synchronization.

## Features

### 🔗 Core Integration Features

- **OAuth Authentication**: Secure connection to Linear workspaces
- **Team Mapping**: Map Linear teams to PeopleOS departments
- **Project Synchronization**: Two-way project creation and updates
- **Task/Issue Management**: Sync tasks between PeopleOS and Linear issues
- **Real-time Updates**: Webhook support for instant synchronization
- **Analytics Integration**: Linear metrics in PeopleOS dashboards

### 🎯 Key Components

1. **Linear Integration Panel**: Management interface for configuration
2. **Team Mapping Configuration**: Map Linear teams to departments
3. **Linear Issue Widget**: Display Linear issues within PeopleOS tasks
4. **Project Management**: Enhanced project management with Linear data
5. **API Endpoints**: RESTful API for Linear operations

## Installation & Setup

### 1. Dependencies

First, install the required dependencies:

```bash
npm install @apollo/client apollo-cache-inmemory apollo-link-http graphql
```

### 2. Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Linear API Configuration
LINEAR_CLIENT_ID=your_linear_client_id
LINEAR_CLIENT_SECRET=your_linear_client_secret
NEXT_PUBLIC_LINEAR_CLIENT_ID=your_linear_client_id
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Linear App Setup

1. Go to [Linear Developer Settings](https://linear.app/settings/api)
2. Create a new OAuth application
3. Set the redirect URI to: `http://localhost:3000/api/linear/auth/callback`
4. Copy the Client ID and Client Secret to your environment variables

## Architecture

### Data Models

The integration uses several MongoDB models to store mapping and synchronization data:

#### LinearWorkspace
```typescript
interface ILinearWorkspace {
  _id: string;
  name: string;
  linearId: string;
  teams: string[];
  integrationStatus: 'active' | 'paused' | 'disconnected';
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: Date;
  lastSyncedAt: Date;
}
```

#### LinearTeam
```typescript
interface ILinearTeam {
  _id: string;
  name: string;
  linearId: string;
  workspaceId: string;
  key: string;
  members: {
    personnelId: string;
    linearUserId: string;
    role: 'admin' | 'member' | 'guest';
  }[];
  projects: string[];
}
```

#### ProjectLinearMapping
```typescript
interface IProjectLinearMapping {
  _id: string;
  projectId: string;
  linearProjectId: string;
  linearTeamId: string;
  syncConfig: {
    syncMilestones: boolean;
    syncComments: boolean;
    syncAttachments: boolean;
    syncStatus: boolean;
  };
}
```

#### TaskLinearMapping
```typescript
interface ITaskLinearMapping {
  _id: string;
  taskId: string;
  linearIssueId: string;
  linearIssueKey: string;
  syncStatus: 'synced' | 'pending_sync' | 'sync_failed';
}
```

### API Client

The `LinearApiClient` class provides a clean interface to the Linear GraphQL API:

```typescript
const linearClient = new LinearApiClient(accessToken);

// Fetch teams
const teams = await linearClient.getTeams();

// Create an issue
const issue = await linearClient.createIssue({
  title: 'New feature request',
  description: 'Detailed description',
  teamId: 'team-id'
});

// Update an issue
const updatedIssue = await linearClient.updateIssue(issueId, {
  title: 'Updated title'
});
```

## Usage

### 1. Setting Up Linear Integration

1. Navigate to the Management Dashboard
2. Click on "Linear Integration" in the sidebar
3. Click "Connect Linear Account"
4. Complete the OAuth flow
5. Map your Linear teams to PeopleOS departments

### 2. Creating Projects with Linear

When creating a new project in PeopleOS:

1. Enable "Create project in Linear" option
2. Select the appropriate Linear team
3. Configure synchronization settings
4. The project will be created in both systems

### 3. Managing Tasks with Linear Issues

Tasks in PeopleOS can be linked to Linear issues:

1. Open a task in PeopleOS
2. Click "Create in Linear" if not already linked
3. The Linear Issue Widget will display issue status
4. Updates sync bidirectionally

### 4. Team Mapping

Map Linear teams to PeopleOS departments:

1. Go to Linear Integration → Team Mapping
2. Select a Linear team for each department
3. Save the configuration
4. Team members will be synchronized

## API Endpoints

### Authentication

- `GET /api/linear/auth/status` - Check authentication status
- `POST /api/linear/auth/callback` - Handle OAuth callback
- `POST /api/linear/auth/disconnect` - Disconnect integration

### Teams & Projects

- `GET /api/linear/teams` - Fetch Linear teams
- `GET /api/linear/teams/[id]/projects` - Fetch team projects
- `GET /api/linear/projects/[id]` - Fetch specific project

### Issues

- `POST /api/linear/issues` - Create new issue
- `GET /api/linear/issues/[id]` - Fetch specific issue
- `PATCH /api/linear/issues/[id]` - Update issue

### Mappings

- `POST /api/linear/task-mappings` - Create task-issue mapping
- `GET /api/linear/task-mappings` - Fetch mappings
- `POST /api/linear/team-mappings` - Save team mappings

## Components

### LinearIntegrationPanel

Main configuration interface for Linear integration:

```tsx
import LinearIntegrationPanel from '@/components/management/modules/LinearIntegrationPanel';

<LinearIntegrationPanel />
```

### LinearIssueWidget

Display Linear issue information within tasks:

```tsx
import LinearIssueWidget from '@/components/linear/LinearIssueWidget';

<LinearIssueWidget 
  task={task}
  linearMapping={mapping}
/>
```

### TeamMappingConfiguration

Configure team mappings:

```tsx
import TeamMappingConfiguration from '@/components/management/modules/linear/TeamMappingConfiguration';

<TeamMappingConfiguration
  departments={departments}
  linearTeams={teams}
  existingMappings={mappings}
  onSaveMapping={handleSave}
/>
```

## Hooks

### useLinearAuth

Manage Linear authentication:

```tsx
const { 
  isAuthenticated, 
  connectToLinear, 
  disconnectLinear 
} = useLinearAuth({ config });
```

### useLinearTeams

Fetch Linear teams:

```tsx
const { teams, loading, error } = useLinearTeams();
```

### useLinearIssue

Manage Linear issues:

```tsx
const { 
  issue, 
  isLoading, 
  updateIssue 
} = useLinearIssue({ issueId });
```

## Synchronization

### Bidirectional Sync

The integration supports bidirectional synchronization:

1. **PeopleOS → Linear**: Changes in PeopleOS are pushed to Linear
2. **Linear → PeopleOS**: Changes in Linear are pulled into PeopleOS
3. **Conflict Resolution**: Last-write-wins with manual override options

### Sync Frequency

- **Real-time**: Webhooks for immediate updates (when configured)
- **Scheduled**: Background sync every 5-60 minutes (configurable)
- **Manual**: On-demand sync triggers

### Error Handling

- Failed syncs are logged and retried
- Sync status is tracked per item
- Manual reconciliation tools available

## Security

### Token Management

- Access tokens are encrypted at rest
- Automatic token refresh
- Secure credential storage
- Regular token rotation

### Permissions

- Granular permission mapping
- Role-based access control
- Audit logging for all operations

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check client ID and secret
   - Verify redirect URI configuration
   - Ensure Linear app is approved

2. **Sync Failures**
   - Check API rate limits
   - Verify token validity
   - Review error logs

3. **Missing Data**
   - Check team mappings
   - Verify sync configuration
   - Manual sync trigger

### Debug Mode

Enable debug logging:

```env
DEBUG=linear:*
```

### Support

For issues and questions:

1. Check the error logs in the Linear Integration panel
2. Review the API documentation
3. Contact the development team

## Roadmap

### Planned Features

- [ ] Advanced workflow mapping
- [ ] Custom field synchronization
- [ ] Bulk operations
- [ ] Advanced analytics
- [ ] Mobile app support
- [ ] Slack integration via Linear Asks
- [ ] Linear Triage integration

### Version History

- **v1.0.0**: Initial release with basic sync
- **v1.1.0**: Team mapping and project sync
- **v1.2.0**: Enhanced UI and error handling
- **v1.3.0**: Real-time sync and webhooks (planned)

## Contributing

When contributing to the Linear integration:

1. Follow the existing code patterns
2. Add tests for new functionality
3. Update documentation
4. Test with real Linear workspace
5. Consider rate limiting and error handling

## License

This integration is part of PeopleOS and follows the same licensing terms. 