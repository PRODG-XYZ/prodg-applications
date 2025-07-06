# Linear Integration Usage Guide

## ⚠️ Work in Progress

**Please note:** The Linear Integration is currently under active development. While you can connect to your Linear workspace and verify that basic data (like team names) can be fetched, advanced features such as Team Mapping, Project Synchronization, and detailed settings are temporarily disabled in the UI and will be available in a future update.

This guide describes both current and planned functionality.

## 🎯 Overview

The Linear Integration allows you to sync projects, tasks, and teams between PeopleOS and Linear seamlessly. This guide shows you how to use all the features.

## 🚀 Getting Started

### Step 1: Connect Linear Account

1. Go to **Management Dashboard** → **Linear Integration**
2. Click **"Connect Linear Workspace"**
3. Complete the OAuth flow in the popup window
4. Return to see your connection confirmed on the **Setup** tab.

### Step 2: Load Basic Data (Verify Connection)

- On the **Setup** tab, after connecting, teams and departments should automatically load.
- You should see:
  - Available Teams count (e.g., 2 teams: Renda AI, ProDG) - This verifies data is fetched from Linear.
  - Departments count (e.g., 5 departments) - This verifies data from PeopleOS.
- If data doesn't auto-load, click the **"Load Data"** button manually.

**Note:** The first time you connect, it may take a few seconds for data to load.

### Step 3: Configure Team Mappings (📝 Feature Under Development)

*This feature is currently disabled in the UI.*

**Intended Functionality:**
1. Go to the (currently disabled) **"Team Mapping"** tab.
2. For each PeopleOS department, you will be able to select a corresponding Linear team.
   - Example: Engineering (PeopleOS) → ProDG (Linear)
3. You will be able to enable/disable sync for each mapping.
4. Click **"Save Mappings"**.

## 📋 Main Features (Partially Available / Under Development)

### Team Management

**View Available Teams:**
- The **Setup** tab currently shows the count and names of teams fetched from Linear, confirming the connection.
- The (currently disabled) **Team Mapping** tab will show full team details and allow mapping.

**Map Teams to Departments:** (📝 Feature Under Development)
- Intended to allow one Linear team per PeopleOS department.

### Project Synchronization (📝 Feature Under Development)

*This feature is currently disabled in the UI.*

**Intended Functionality:**
- Create projects in PeopleOS and have them automatically sync to Linear.
- Link existing PeopleOS projects to Linear projects.
- Two-way synchronization of project status, details, etc.

### Task Management (📝 Feature Under Development)

*This feature is currently disabled in the UI.*

**Intended Functionality:**
- Auto-create Linear issues from PeopleOS tasks (e.g., for high-priority items).
- Sync task status, assignees, and progress between systems.
- View Linear issue details within PeopleOS.

### Analytics and Insights (📝 Feature Under Development)

*This feature is currently disabled in the UI.*

**Intended Functionality:**
- View integration analytics, sync success rates, and team performance metrics.

## 🛠️ Advanced Features (Under Development)

Features like Automation Rules, detailed Real-time Synchronization controls, and Conflict Resolution tools are planned for future releases.

## 🎛️ Settings and Configuration

- Currently, the **Settings** tab is a placeholder.
- Future versions will allow configuration of sync settings, data scope, and notification preferences.

## 🔧 Troubleshooting

### Quick Fixes

**Connection Issues / Not Authenticated:**
1. On the **Setup** tab, click **"Disconnect"**.
2. Click **"Connect Linear Workspace"** and complete the OAuth flow again.
3. Check internet connection.
4. Refresh the page (hard refresh: Ctrl+Shift+R or Cmd+Shift+R).

**Data Not Loading on Setup Tab:**
1. Ensure you are connected (see above).
2. Click the **"Load Data"** button on the **Setup** tab.
3. Check browser console for errors (see Debug Guide).

### Getting Help

- Refer to the `LINEAR_INTEGRATION_DEBUG_GUIDE.md` for more detailed troubleshooting steps.
- Check browser console (F12 or Right-click > Inspect > Console) for error messages.
- Review server logs in your terminal.

## 📈 Best Practices (General)

1.  **Ensure Correct Environment Variables**: Your `.env.local` file must have `LINEAR_CLIENT_ID`, `LINEAR_CLIENT_SECRET`, `NEXT_PUBLIC_LINEAR_CLIENT_ID`, and `NEXT_PUBLIC_BASE_URL` correctly set up.
2.  **Verify Linear OAuth App Configuration**: In your Linear workspace settings (Settings > API), ensure your OAuth application has the correct Redirect URI: `http://localhost:3000/api/linear/auth/callback` (or your deployed URL equivalent) and the necessary `read` and `write` scopes.

As development progresses, this guide will be updated with more specific instructions for the enabled features. 