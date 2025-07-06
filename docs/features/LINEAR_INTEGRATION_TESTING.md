# Linear Integration Testing Guide

This guide walks you through testing all aspects of the Linear API integration in PeopleOS.

## Prerequisites

1. **Linear OAuth App Created**: You should have Client ID and Secret from Linear
2. **Environment Variables Set**: `.env.local` configured with Linear credentials
3. **MongoDB Running**: Local MongoDB instance running
4. **Development Server**: `pnpm dev` running on localhost:3000

## Testing Checklist

### ✅ 1. Basic Integration Test

Test the core integration setup:

```bash
curl http://localhost:3000/api/linear/test
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Linear integration test successful",
  "database": {
    "connected": true,
    "workspaces": 0
  },
  "environment": {
    "hasClientId": true,
    "hasClientSecret": true,
    "baseUrl": "http://localhost:3000"
  }
}
```

### ✅ 2. Authentication Flow Test

1. **Access Management Dashboard**:
   - Go to: `http://localhost:3000/management`
   - Navigate to "Linear Integration" tab

2. **Connect Linear Account**:
   - Click "Connect Linear Account"
   - Should redirect to Linear OAuth page
   - Authorize the application
   - Should redirect back with success message

3. **Verify Connection**:
   ```bash
   curl http://localhost:3000/api/linear/auth/status
   ```

### ✅ 3. Teams API Test

After authentication, test team fetching:

```bash
curl http://localhost:3000/api/linear/teams
```

**Expected Response:**
```json
{
  "teams": [
    {
      "id": "team-id",
      "name": "Engineering",
      "key": "ENG",
      "description": "Engineering team",
      "members": [...]
    }
  ]
}
```

### ✅ 4. Issue Creation Test

Test creating a Linear issue:

```bash
curl -X POST http://localhost:3000/api/linear/issues \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Issue from PeopleOS",
    "description": "This is a test issue created via the API",
    "teamId": "your-team-id"
  }'
```

### ✅ 5. Team Mapping Test

1. **Access Team Mapping**:
   - Go to Linear Integration → Team Mapping tab
   - Should see list of departments and Linear teams

2. **Create Mapping**:
   - Map a Linear team to a department
   - Click "Save Team Configuration"
   - Should see success message

3. **Verify Mapping**:
   ```bash
   curl http://localhost:3000/api/linear/task-mappings
   ```

### ✅ 6. Project Management Test

1. **Access Project Management**:
   - Go to Management Dashboard → Projects
   - Click "Create Project"

2. **Create Project with Linear**:
   - Enable "Create project in Linear" option
   - Select Linear team
   - Configure sync settings
   - Create project

3. **Verify Project Creation**:
   - Check project appears in both PeopleOS and Linear
   - Verify project details sync correctly

### ✅ 7. Linear Issue Widget Test

1. **Create Task in PeopleOS**:
   - Create a new task in the system
   - Should see "Create in Linear" option

2. **Link to Linear**:
   - Click "Create in Linear"
   - Enter team ID when prompted
   - Should create Linear issue and show widget

3. **Verify Widget Display**:
   - Widget should show Linear issue key
   - Status, priority, and assignee should display
   - "Open in Linear" button should work

### ✅ 8. Synchronization Test

1. **Update in Linear**:
   - Change issue status in Linear
   - Update issue title or description

2. **Verify Sync in PeopleOS**:
   - Changes should appear in PeopleOS (may take a few minutes)
   - Check sync status in Linear Integration panel

3. **Update in PeopleOS**:
   - Change task status in PeopleOS
   - Update task details

4. **Verify Sync in Linear**:
   - Changes should appear in Linear
   - Check for sync errors in logs

## Troubleshooting Common Issues

### Issue: "No active Linear workspace found"

**Solution:**
1. Check authentication status: `curl http://localhost:3000/api/linear/auth/status`
2. Re-authenticate if needed
3. Verify environment variables are set correctly

### Issue: "Failed to fetch teams"

**Solution:**
1. Check Linear API permissions
2. Verify OAuth app has correct scopes (read, write)
3. Check network connectivity to Linear API

### Issue: "Sync failures"

**Solution:**
1. Check API rate limits (Linear allows 200 requests/minute)
2. Verify token hasn't expired
3. Check error logs in browser console

### Issue: Team mapping not working

**Solution:**
1. Ensure departments exist in PeopleOS
2. Verify Linear teams are accessible
3. Check database connection

## Performance Testing

### Load Testing

Test with multiple concurrent requests:

```bash
# Test multiple team requests
for i in {1..10}; do
  curl http://localhost:3000/api/linear/teams &
done
wait
```

### Rate Limit Testing

Monitor rate limit headers in responses:

```bash
curl -I http://localhost:3000/api/linear/teams
```

Look for headers like:
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Integration Health Monitoring

### Database Queries

Check Linear workspace status:

```javascript
// In MongoDB shell or Compass
db.linearworkspaces.find({})
db.linearteams.find({})
db.projectlinearmappings.find({})
db.tasklinearmappings.find({})
```

### API Endpoint Health

Create a monitoring script:

```bash
#!/bin/bash
echo "Testing Linear Integration Health..."

# Test basic integration
curl -s http://localhost:3000/api/linear/test | jq '.success'

# Test authentication
curl -s http://localhost:3000/api/linear/auth/status | jq '.isAuthenticated'

# Test teams (if authenticated)
curl -s http://localhost:3000/api/linear/teams | jq '.teams | length'

echo "Health check complete"
```

## Manual Testing Scenarios

### Scenario 1: New Team Member Onboarding

1. Add new team member to Linear team
2. Verify they appear in PeopleOS team mapping
3. Create task assigned to new member
4. Verify assignment syncs to Linear

### Scenario 2: Project Lifecycle

1. Create project in PeopleOS with Linear integration
2. Add milestones and tasks
3. Track progress through Linear cycles
4. Complete project and verify status sync

### Scenario 3: Cross-Platform Workflow

1. Create issue in Linear
2. Verify it appears in PeopleOS
3. Update status in PeopleOS
4. Add comments in both systems
5. Verify bidirectional sync

## Automated Testing

### Unit Tests

Run existing unit tests:

```bash
pnpm test
```

### Integration Tests

Run integration test suite:

```bash
pnpm test:integration
```

### End-to-End Tests

Run E2E tests (if configured):

```bash
pnpm test:e2e
```

## Success Criteria

The integration is working correctly when:

- ✅ All API endpoints return expected responses
- ✅ OAuth authentication flow completes successfully
- ✅ Teams and projects sync bidirectionally
- ✅ Issue widgets display correct information
- ✅ No sync errors in logs
- ✅ Performance is acceptable (< 2s response times)
- ✅ Rate limits are respected
- ✅ Error handling works gracefully

## Reporting Issues

When reporting issues, include:

1. **Error Message**: Full error text
2. **Steps to Reproduce**: Exact steps taken
3. **Environment**: Browser, OS, Node version
4. **API Response**: Full response from failing endpoint
5. **Logs**: Relevant console/server logs
6. **Linear Setup**: Team configuration, permissions

## Next Steps After Testing

Once testing is complete:

1. **Production Setup**: Configure production environment variables
2. **Webhook Setup**: Configure Linear webhooks for real-time sync
3. **User Training**: Train team members on the integration
4. **Monitoring**: Set up production monitoring and alerts
5. **Documentation**: Update user documentation with any changes 