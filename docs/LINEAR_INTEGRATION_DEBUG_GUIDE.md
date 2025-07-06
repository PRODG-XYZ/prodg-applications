# Linear Integration Debug Guide

## ⚠️ Work in Progress & UI Changes

**Please note:** The Linear Integration is currently under active development. To stabilize the core connection functionality, several UI elements related to advanced features (Team Mapping, Project Sync, detailed Settings) have been temporarily commented out in the `LinearIntegrationPanel.tsx` component. 

This guide will primarily focus on debugging the **connection setup** and **basic data loading** (teams from Linear, departments from PeopleOS) which are currently active. References to tabs or UI elements for Team Mapping or Project Sync might not be visible in the current interface.

## 🚀 Quick Start & Current Usage

### Setting Up Linear Integration

1. **Navigate to Management Dashboard**
   ```
   http://localhost:3000/management-dashboard
   ```

2. **Go to Linear Integration**
   - Click "Linear Integration" in the sidebar
   - You should see the Linear Integration panel (currently simplified)

3. **Connect Your Account**
   - On the **Setup** tab, click "Connect Linear Workspace"
   - Complete OAuth flow in the new tab
   - Return to see connection success

4. **Verify Data Loading (Setup Tab)**
   - Teams from Linear and Departments from PeopleOS should auto-load on the **Setup** tab
   - If not, click the "Load Data" button
   - You should see counts for "Available Teams (from Linear)" and "Departments (PeopleOS)"

*(Team Mapping and Project Sync tabs/features are currently disabled in the UI).*

## 🔍 Debugging Common Issues

### Issue 1: Cannot Connect / OAuth Failure

**Symptoms:**
- Clicking "Connect Linear Workspace" leads to an error page from Linear
- Redirect back to PeopleOS with an error in the URL (e.g., `?linear_error=...`)
- Error message in the Linear Integration panel like "Authentication failed" or "Connection Error"

**Debug Steps:**

1. **Verify Environment Variables:**
   Ensure `LINEAR_CLIENT_ID`, `LINEAR_CLIENT_SECRET`, `NEXT_PUBLIC_LINEAR_CLIENT_ID`, and `NEXT_PUBLIC_BASE_URL` are correctly set in your `.env.local` file
   ```bash
   cat .env.local | grep LINEAR
   cat .env.local | grep NEXT_PUBLIC_BASE_URL
   ```

2. **Check Linear OAuth App Configuration:**
   - Go to your Linear Workspace settings: Settings > API > Your OAuth App
   - **Redirect URI must be exactly:** `http://localhost:3000/api/linear/auth/callback` (or your production URL equivalent if deployed)
   - Ensure **Scopes** include `read` and `write`

3. **Inspect Server Logs:**
   When the OAuth callback occurs (e.g., `GET /api/linear/auth/callback?...`), check your `pnpm dev` terminal for errors like "Failed to exchange code for token". This often indicates a mismatch in client ID/secret or redirect URI

4. **Inspect Browser Console & Network Tab:**
   - Open Developer Tools (F12) when clicking "Connect"
   - Look for errors in the Console
   - Check the Network tab to see the redirect to Linear and the callback to your app

### Issue 2: Connected, but Data (Teams/Departments) Not Loading on Setup Tab

**Symptoms:**
- Panel shows "Linear Connected" or successful connection message
- "Available Teams" or "Departments" show 0 or loading indefinitely
- "Load Data" button doesn't seem to populate the data

**Debug Steps:**

1. **Check API Connection Status:**
   ```bash
   curl http://localhost:3000/api/linear/auth/status | python3 -m json.tool
   ```
   * Expected: `"isAuthenticated": true` and valid token information
   * If `"isAuthenticated": false` but `"workspace.isConnected": true`, it might be an old/invalid token issue (see Issue 5)

2. **Test Teams API Directly:**
   ```bash
   curl http://localhost:3000/api/linear/teams | python3 -m json.tool
   ```
   * Expected: JSON output with an array of your Linear teams
   * If this fails or returns an error, there's an issue with the backend fetching teams (check server logs for Linear API client errors)

3. **Test Departments API Directly:**
   ```bash
   curl http://localhost:3000/api/departments | python3 -m json.tool
   ```
   * Expected: JSON output with an array of your PeopleOS departments

4. **Check Browser Console:**
   - Look for the "Auto-load effect check" and "Auto-loading Linear data..." messages
   - Check for any JavaScript errors during the `loadData` process or state updates

5. **Server Logs for Data Fetching:**
   - Your `pnpm dev` logs should show attempts to fetch from `/api/linear/teams` and `/api/departments` when `loadData` is triggered
   - Look for errors from these backend endpoints

### Issue 3: "Maximum update depth exceeded" Error

**Symptoms:**
- Error in browser console: "Maximum update depth exceeded"
- Page becomes unresponsive or stuck in a loading loop
- Repeated calls to `/api/linear/auth/status` visible in network tab or server logs

**Root Cause:**
This React error occurs due to a circular dependency in component rendering and state/effect updates, most commonly: A `useEffect` hook updates state, which causes a dependency of that same effect to change, triggering the effect again

**Fixes Applied & Checks:**
- **`useLinearAuth` Hook:** Refactored to use `useMemo` for `authUrl` generation to ensure its stability. Dependencies of `checkAuthStatus` and other callbacks/effects were reviewed. Initial `isLoading` set to `true`
- **`LinearIntegrationPanel` Component:**
  - `linearAuthConfig` is memoized with `useMemo` to ensure it's stable when passed to `useLinearAuth`
  - OAuth callback processing (`router.replace`) moved into a `useEffect` hook
  - `loadData` function structure and its `useEffect` trigger reviewed for stability

**If you still encounter this:**
1. **Identify the source:** The error stack trace in the browser console should point to the component or hook (`useLinearAuth.useEffect`, `LinearIntegrationPanel.useEffect`) causing the loop
2. **Examine Dependencies:** Carefully review the dependency arrays of `useEffect` and `useCallback` hooks in the identified file. Ensure all dependencies are stable or genuinely need to trigger re-execution
3. **Console Logs:** Use `console.log` just before `setState` calls within effects to see if they are being called unexpectedly or too frequently

### Issue 4: UI Not Updating After Actions (e.g., Disconnect)

**Symptoms:**
- Clicking "Disconnect" doesn't visually update the panel to "Not Connected" state immediately, or teams data persists

**Debug Steps & Fixes Applied:**
- **State Resets:** The `handleDisconnect` function in `LinearIntegrationPanel` and the backend `/api/linear/auth/disconnect` route were updated to more thoroughly reset states (e.g., `isAuthenticated`, `tokens`, `workspace`, `dataLoaded`, `autoLoadTriggered`, `teams`, `departments`, and clearing LinearWorkspace model fields)
- **OAuth Callback State Reset:** On successful OAuth connection (`linear_connected=true`), `dataLoaded` and `autoLoadTriggered` are reset to ensure data re-fetches

**If this persists:**
1. Verify `refetchAuthStatus` is called after actions that change auth state
2. Ensure all relevant local component states are being reset

### Issue 5: Token Expired - Teams Not Loading After Reconnection or Over Time

*This is similar to Issue 2 but specifically after a period of inactivity or explicit reconnection.*

**Symptoms:**
- Teams don't load even after a successful OAuth reconnection flow
- `/api/linear/auth/status` shows `"isAuthenticated": false` and `"tokens": null`, but `"workspace.isConnected": true` might still be true (indicating an old record)
- UI might show "Linear Connected" but no data loads for teams

**Root Cause:**
Linear OAuth access tokens expire (typically after 90 days). While refresh tokens can extend this, the refresh mechanism might fail, or the refresh token itself might expire or be invalidated. The system might *think* it's connected due to a stale database record, but API calls fail due to invalid tokens

**Debug Steps & Fixes Applied:**

1. **Automatic Token Refresh:** The `/api/linear/auth/status` endpoint now attempts to use the `refreshToken` to get a new `accessToken` if the current one is detected as expired. This should handle most cases transparently

2. **Disconnect Endpoint:** The `/api/linear/auth/disconnect` endpoint was improved to more thoroughly clear all token and connection status fields in the `LinearWorkspace` database record

3. **`LinearIntegrationPanel` Disconnect:** The `handleDisconnect` function in the UI now also resets local states like `teams`, `departments`, `dataLoaded`, and `autoLoadTriggered` and attempts to clear the `useLinearTeams` hook cache via `refetchTeams()`

**If Token Refresh Fails & Manual Reconnection is Needed:**
1. **Click "Disconnect"** in the Linear Integration panel. This should now properly clear the backend state

2. **Verify Disconnection:**
   ```bash
   curl http://localhost:3000/api/linear/auth/status | python3 -m json.tool
   ```
   Expected: `"isAuthenticated": false`, `"workspace": null`, `"tokens": null`

3. **Click "Connect Linear Workspace"** again and complete the OAuth flow

4. **Verify After Reconnection:** Check auth status and teams API as in Issue 2

### Issue 6: "Cannot update a component while rendering" Error

**Symptoms:**
- Error in console: "Cannot update a component (`Router`) while rendering a different component (`LinearIntegrationPanel`)"
- Teams might not display correctly even if data is fetched

**Root Cause:**
This React error occurs when a state-updating function (like `router.replace()` or a `setState` from `useState`) is called directly within the render body of a component, instead of inside a `useEffect` hook or an event handler

**Fix Applied:**
- In `LinearIntegrationPanel.tsx`, the logic for handling the OAuth callback parameters (`linear_connected`, `linear_error` from `searchParams`) and calling `router.replace()` was moved from a direct call in the render body into a `useEffect` hook. A `callbackProcessed` state variable was added to ensure this effect runs only once per relevant URL change

**If you still see this error:**
1. Identify which component is causing the issue from the stack trace
2. Look for any direct calls to `setState` or router methods within its main body. Move them to `useEffect` or event handlers

## 🛠️ Manual Testing Procedures (Focus on Connection)

### Test 1: Full Connection & Disconnection Flow

1. **Ensure Disconnected State:**
   ```bash
   curl -X POST http://localhost:3000/api/linear/auth/disconnect
   curl http://localhost:3000/api/linear/auth/status | python3 -m json.tool 
   # Expected: isAuthenticated: false, workspace: null
   ```

2. **Connect via UI:**
   - Go to the Linear Integration panel
   - Click "Connect Linear Workspace". Complete OAuth
   - Verify success message and that Setup tab shows connected status and loads team/department counts

3. **Check Auth Status API:**
   ```bash
   curl http://localhost:3000/api/linear/auth/status | python3 -m json.tool
   # Expected: isAuthenticated: true, valid tokens & workspace info
   ```

4. **Check Teams API:**
   ```bash
   curl http://localhost:3000/api/linear/teams | python3 -m json.tool
   # Expected: Your Linear teams data
   ```

5. **Disconnect via UI:**
   - Click "Disconnect" in the panel
   - Verify UI updates to disconnected state

6. **Check Auth Status API Again:**
   ```bash
   curl http://localhost:3000/api/linear/auth/status | python3 -m json.tool 
   # Expected: isAuthenticated: false, workspace: null
   ```

## 🔧 Configuration Verification

### Environment Variables Checklist

Ensure `.env.local` has (replace with your actual values):
```env
# Required for Linear Integration
LINEAR_CLIENT_ID=your_linear_client_id_from_linear
LINEAR_CLIENT_SECRET=your_linear_client_secret_from_linear
NEXT_PUBLIC_LINEAR_CLIENT_ID=your_linear_client_id_from_linear 
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# MongoDB (should already exist)
MONGODB_URI=your_mongodb_connection_string
```
**Important**: `NEXT_PUBLIC_LINEAR_CLIENT_ID` must be the same as `LINEAR_CLIENT_ID` for client-side logic to correctly identify if the integration is configured

### Linear OAuth App Setup Checklist

1. **In Linear:** Go to Settings > API > OAuth applications
2. **Application Name:** e.g., "PeopleOS Dev"
3. **Redirect URI:** `http://localhost:3000/api/linear/auth/callback` (must match exactly, including port and http/https)
4. **Scopes:** Ensure `read` and `write` are selected

### Database Schema Verification (Relevant Collections)

- `linearworkspaces`: Stores connection details, tokens for the Linear workspace
- `departments`: PeopleOS departments (used for future mapping)
- (Other collections like `projects`, `tasks` are for future sync features)

## 📊 Monitoring and Logs

### Key Log Messages to Watch (Server-Side - `pnpm dev` terminal)

- **Connection:**
  - `Error handling Linear auth callback: ...` (Indicates issues during OAuth token exchange)
  - `Disconnected X Linear workspace(s)` (Successful disconnect)
  - `Failed to refresh Linear token: ...` (Problem with automatic token refresh)

- **API Calls:**
  - `Fetching teams from Linear API...` (When `/api/linear/teams` is called)
  - `Successfully fetched X teams from Linear`
  - Any errors from the Linear API client (e.g., 401, 403, 429 rate limiting)

### Key Log Messages to Watch (Client-Side - Browser Console)

- `Auto-load effect check: {...}` (Shows state variables influencing auto-load logic in `LinearIntegrationPanel`)
- `Auto-loading Linear data...` (When `LinearIntegrationPanel` attempts to load data)
- `Error loading data: ...` (If client-side fetch to `/api/departments` or `/api/linear/teams` fails)
- `Linear auth status check failed: ...` (From `useLinearAuth` if `/api/linear/auth/status` call fails)

## 🚨 Emergency Troubleshooting

### Full Reset of Linear Integration

If connection is persistently broken or in a weird state:

1. **Disconnect via UI (if possible):** Click "Disconnect" in the Linear Integration panel
2. **Force Disconnect via API:**
   ```bash
   curl -X POST http://localhost:3000/api/linear/auth/disconnect
   ```

3. **Clear Relevant Database Record(s):**
   - Connect to your MongoDB
   - In the `linearworkspaces` collection, delete any documents. Example mongo shell command:
     ```javascript
     db.linearworkspaces.deleteMany({});
     ```

4. **Clear Browser Data for `localhost:3000`:**
   - Site settings > Clear data (cookies, localStorage, cache)

5. **Restart Development Server:** Stop `pnpm dev` (Ctrl+C) and restart it

6. **Attempt Reconnection:** Go through the UI connection flow again

### Last Resort: Check Linear Status & App Config

- [Linear Status Page](https://status.linear.app/): Check for ongoing Linear incidents
- Double-check your Linear OAuth App configuration (Redirect URI, Client ID/Secret are correctly in `.env.local`)

This guide should help in navigating the current state of the Linear integration. As features are re-enabled and finalized, this document will be updated 