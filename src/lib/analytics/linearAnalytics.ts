import { connectToDatabase } from '../mongodb';
import Project, { IProject } from '../models/Project';
import Task, { ITask } from '../models/Task';
import { LinearApiClient } from '../linear/client';
import LinearWorkspace from '../models/LinearWorkspace';

export interface LinearAnalyticsData {
  overview: {
    totalProjects: number;
    connectedProjects: number;
    totalTasks: number;
    syncedTasks: number;
    syncSuccessRate: number;
  };
  projectMetrics: {
    statusDistribution: { [key: string]: number };
    priorityDistribution: { [key: string]: number };
    syncStatusDistribution: { [key: string]: number };
    averageProgress: number;
    projectsWithLinear: number;
  };
  taskMetrics: {
    statusDistribution: { [key: string]: number };
    priorityDistribution: { [key: string]: number };
    assignmentDistribution: { assigned: number; unassigned: number };
    completionRate: number;
    averageCycleTime: number;
  };
  syncMetrics: {
    lastSyncTimes: { projectId: string; lastSynced: Date | null; status: string }[];
    syncErrors: { projectId: string; error: string; timestamp: Date }[];
    syncFrequency: { successful: number; failed: number; total: number };
  };
  timeSeriesData: {
    projectCreation: { date: string; count: number }[];
    taskCompletion: { date: string; count: number }[];
    syncActivity: { date: string; syncs: number }[];
  };
  teamPerformance: {
    teamId: string;
    teamName: string;
    projectCount: number;
    taskCount: number;
    completedTasks: number;
    averageTaskTime: number;
    syncHealth: number;
  }[];
}

export interface LinearVelocityData {
  teamId: string;
  teamName: string;
  cycles: {
    cycleId: string;
    cycleName: string;
    startDate: Date;
    endDate: Date;
    plannedPoints: number;
    completedPoints: number;
    velocity: number;
    issueCount: number;
    completedIssues: number;
  }[];
  averageVelocity: number;
  velocityTrend: 'up' | 'down' | 'stable';
}

export interface LinearInsightData {
  burndownData: {
    date: string;
    remaining: number;
    completed: number;
  }[];
  cyclePerformance: {
    cycleId: string;
    name: string;
    completionRate: number;
    daysRemaining: number;
    issuesRemaining: number;
  }[];
  teamWorkload: {
    teamId: string;
    teamName: string;
    activeIssues: number;
    capacity: number;
    utilization: number;
  }[];
}

export class LinearAnalyticsService {
  private linearClient: LinearApiClient | null = null;

  constructor() {
    this.initializeClient();
  }

  private async initializeClient() {
    try {
      const workspace = await LinearWorkspace.findOne({ isConnected: true });
      if (workspace?.accessToken) {
        this.linearClient = new LinearApiClient(workspace.accessToken);
      }
    } catch (error) {
      console.error('Failed to initialize Linear client for analytics:', error);
    }
  }

  async getLinearAnalytics(timeRange: '7d' | '30d' | '90d' = '30d'): Promise<LinearAnalyticsData> {
    await connectToDatabase();

    const startDate = this.getStartDate(timeRange);

    // Fetch data in parallel
    const [
      projects,
      tasks,
      projectCounts,
      taskCounts
    ] = await Promise.all([
      Project.find({ createdAt: { $gte: startDate } }).lean(),
      Task.find({ createdAt: { $gte: startDate } }).lean(),
      this.getProjectCounts(),
      this.getTaskCounts()
    ]);

    // Calculate overview metrics
    const overview = {
      totalProjects: projectCounts.total,
      connectedProjects: projectCounts.connected,
      totalTasks: taskCounts.total,
      syncedTasks: taskCounts.synced,
      syncSuccessRate: taskCounts.total > 0 ? (taskCounts.synced / taskCounts.total) * 100 : 0
    };

    // Calculate project metrics
    const projectMetrics = this.calculateProjectMetrics(projects);

    // Calculate task metrics
    const taskMetrics = await this.calculateTaskMetrics(tasks);

    // Get sync metrics
    const syncMetrics = await this.getSyncMetrics();

    // Generate time series data
    const timeSeriesData = await this.getTimeSeriesData(startDate);

    // Get team performance data
    const teamPerformance = await this.getTeamPerformance();

    return {
      overview,
      projectMetrics,
      taskMetrics,
      syncMetrics,
      timeSeriesData,
      teamPerformance
    };
  }

  async getLinearVelocity(teamIds: string[]): Promise<LinearVelocityData[]> {
    if (!this.linearClient) {
      throw new Error('Linear client not initialized');
    }

    const velocityData: LinearVelocityData[] = [];

    for (const teamId of teamIds) {
      try {
        // This would require Linear API calls to get cycle data
        // For now, we'll use placeholder data
        const teamName = await this.getTeamName(teamId);
        
        const cycles = await this.getTeamCycles(teamId);
        const averageVelocity = cycles.length > 0 
          ? cycles.reduce((sum, c) => sum + c.velocity, 0) / cycles.length 
          : 0;

        // Determine velocity trend
        const recentCycles = cycles.slice(-3);
        const velocityTrend = this.calculateVelocityTrend(recentCycles);

        velocityData.push({
          teamId,
          teamName,
          cycles,
          averageVelocity,
          velocityTrend
        });
      } catch (error) {
        console.error(`Error getting velocity data for team ${teamId}:`, error);
      }
    }

    return velocityData;
  }

  async getLinearInsights(projectIds: string[]): Promise<LinearInsightData> {
    await connectToDatabase();

    // Get burndown data
    const burndownData = await this.getBurndownData(projectIds);

    // Get cycle performance
    const cyclePerformance = await this.getCyclePerformance(projectIds);

    // Get team workload
    const teamWorkload = await this.getTeamWorkload();

    return {
      burndownData,
      cyclePerformance,
      teamWorkload
    };
  }

  // Helper methods
  private getStartDate(timeRange: string): Date {
    const now = new Date();
    switch (timeRange) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  private async getProjectCounts() {
    const [total, connected] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ linearProjectId: { $exists: true, $ne: null } })
    ]);
    return { total, connected };
  }

  private async getTaskCounts() {
    const [total, synced] = await Promise.all([
      Task.countDocuments(),
      Task.countDocuments({ syncStatus: 'synced' })
    ]);
    return { total, synced };
  }

  private calculateProjectMetrics(projects: any[]) {
    const statusDistribution = this.getDistribution(projects, 'status');
    const priorityDistribution = this.getDistribution(projects, 'priority');
    const syncStatusDistribution = this.getDistribution(projects, 'syncStatus');
    const averageProgress = projects.length > 0 
      ? projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length 
      : 0;
    const projectsWithLinear = projects.filter(p => p.linearProjectId).length;

    return {
      statusDistribution,
      priorityDistribution,
      syncStatusDistribution,
      averageProgress,
      projectsWithLinear
    };
  }

  private async calculateTaskMetrics(tasks: any[]) {
    const statusDistribution = this.getDistribution(tasks, 'status');
    const priorityDistribution = this.getDistribution(tasks, 'priority');
    const assignmentDistribution = {
      assigned: tasks.filter(t => t.assignedTo).length,
      unassigned: tasks.filter(t => !t.assignedTo).length
    };
    const completionRate = tasks.length > 0 
      ? (tasks.filter(t => t.status === 'done').length / tasks.length) * 100 
      : 0;

    // Calculate average cycle time (time from created to completed)
    const completedTasks = tasks.filter(t => t.status === 'done' && t.completedAt);
    const averageCycleTime = completedTasks.length > 0
      ? completedTasks.reduce((sum, t) => {
          const cycleTime = new Date(t.completedAt).getTime() - new Date(t.createdAt).getTime();
          return sum + (cycleTime / (1000 * 60 * 60 * 24)); // Convert to days
        }, 0) / completedTasks.length
      : 0;

    return {
      statusDistribution,
      priorityDistribution,
      assignmentDistribution,
      completionRate,
      averageCycleTime
    };
  }

  private async getSyncMetrics() {
    const projects = await Project.find({}, 'lastSyncedAt syncStatus lastSyncError').lean();
    
    const lastSyncTimes = projects.map(p => ({
      projectId: p._id.toString(),
      lastSynced: p.lastSyncedAt || null,
      status: p.syncStatus || 'not_synced'
    }));

    const syncErrors = projects
      .filter(p => p.lastSyncError)
      .map(p => ({
        projectId: p._id.toString(),
        error: p.lastSyncError!,
        timestamp: p.lastSyncedAt || new Date()
      }));

    const successful = projects.filter(p => p.syncStatus === 'synced').length;
    const failed = projects.filter(p => p.syncStatus === 'sync_failed').length;
    const total = projects.length;

    return {
      lastSyncTimes,
      syncErrors,
      syncFrequency: { successful, failed, total }
    };
  }

  private async getTimeSeriesData(startDate: Date) {
    // Generate time series data for the specified range
    const projectCreation = await this.getTimeSeriesCount(Project, startDate, 'createdAt');
    const taskCompletion = await this.getTimeSeriesCount(Task, startDate, 'completedAt', { status: 'done' });
    const syncActivity = await this.getTimeSeriesCount(Project, startDate, 'lastSyncedAt', { syncStatus: 'synced' });

    return {
      projectCreation,
      taskCompletion,
      syncActivity: syncActivity.map(item => ({ date: item.date, syncs: item.count }))
    };
  }

  private async getTimeSeriesCount(model: any, startDate: Date, dateField: string, filter: any = {}) {
    const pipeline = [
      {
        $match: {
          ...filter,
          [dateField]: { $gte: startDate, $ne: null }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: `$${dateField}`
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ];

    const results = await model.aggregate(pipeline);
    return results.map(r => ({ date: r._id, count: r.count }));
  }

  private async getTeamPerformance() {
    // This would require mapping Linear teams to projects and calculating metrics
    // For now, return placeholder data
    return [];
  }

  private getDistribution(items: any[], field: string): { [key: string]: number } {
    return items.reduce((dist, item) => {
      const value = item[field] || 'unknown';
      dist[value] = (dist[value] || 0) + 1;
      return dist;
    }, {});
  }

  // Placeholder methods for Linear-specific data
  private async getTeamName(teamId: string): Promise<string> {
    return `Team ${teamId.slice(-6)}`;
  }

  private async getTeamCycles(teamId: string) {
    // This would call Linear API to get actual cycle data
    return [];
  }

  private calculateVelocityTrend(cycles: any[]): 'up' | 'down' | 'stable' {
    if (cycles.length < 2) return 'stable';
    
    const recent = cycles[cycles.length - 1].velocity;
    const previous = cycles[cycles.length - 2].velocity;
    
    if (recent > previous * 1.1) return 'up';
    if (recent < previous * 0.9) return 'down';
    return 'stable';
  }

  private async getBurndownData(projectIds: string[]) {
    // Generate burndown chart data
    return [];
  }

  private async getCyclePerformance(projectIds: string[]) {
    // Get cycle performance data
    return [];
  }

  private async getTeamWorkload() {
    // Get team workload data
    return [];
  }
}

export default new LinearAnalyticsService(); 