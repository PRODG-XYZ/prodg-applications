import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import Task from '@/lib/models/Task';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    // Fetch projects and tasks data
    const [
      totalProjects,
      connectedProjects,
      totalTasks,
      syncedTasks,
      recentProjects,
      recentTasks
    ] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ linearProjectId: { $exists: true, $ne: null } }),
      Task.countDocuments(),
      Task.countDocuments({ syncStatus: 'synced' }),
      Project.find({ createdAt: { $gte: startDate } }).lean(),
      Task.find({ createdAt: { $gte: startDate } }).lean()
    ]);
    
    // Calculate overview metrics
    const overview = {
      totalProjects,
      connectedProjects,
      totalTasks,
      syncedTasks,
      syncSuccessRate: totalTasks > 0 ? Math.round((syncedTasks / totalTasks) * 100) : 0,
      connectionRate: totalProjects > 0 ? Math.round((connectedProjects / totalProjects) * 100) : 0
    };
    
    // Calculate project metrics
    const projectStatusDistribution = getDistribution(recentProjects, 'status');
    const projectPriorityDistribution = getDistribution(recentProjects, 'priority');
    const projectSyncDistribution = getDistribution(recentProjects, 'syncStatus');
    
    const projectMetrics = {
      statusDistribution: projectStatusDistribution,
      priorityDistribution: projectPriorityDistribution,
      syncStatusDistribution: projectSyncDistribution,
      averageProgress: recentProjects.length > 0 
        ? Math.round(recentProjects.reduce((sum: number, p: any) => sum + (p.progress || 0), 0) / recentProjects.length)
        : 0,
      projectsWithLinear: recentProjects.filter((p: any) => p.linearProjectId).length
    };
    
    // Calculate task metrics
    const taskStatusDistribution = getDistribution(recentTasks, 'status');
    const taskPriorityDistribution = getDistribution(recentTasks, 'priority');
    const assignedTasks = recentTasks.filter((t: any) => t.assignedTo).length;
    const unassignedTasks = recentTasks.length - assignedTasks;
    const completedTasks = recentTasks.filter((t: any) => t.status === 'done').length;
    
    const taskMetrics = {
      statusDistribution: taskStatusDistribution,
      priorityDistribution: taskPriorityDistribution,
      assignmentDistribution: {
        assigned: assignedTasks,
        unassigned: unassignedTasks
      },
      completionRate: recentTasks.length > 0 ? Math.round((completedTasks / recentTasks.length) * 100) : 0,
      totalAssigned: assignedTasks,
      totalCompleted: completedTasks
    };
    
    // Get sync health data
    const syncMetrics = await getSyncMetrics();
    
    // Generate time series data
    const timeSeriesData = await getTimeSeriesData(startDate);
    
    return NextResponse.json({
      overview,
      projectMetrics,
      taskMetrics,
      syncMetrics,
      timeSeriesData,
      timeRange,
      generatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error generating Linear analytics:', error);
    return NextResponse.json(
      { error: 'Failed to generate analytics' },
      { status: 500 }
    );
  }
}

function getDistribution(items: any[], field: string): { [key: string]: number } {
  return items.reduce((dist: { [key: string]: number }, item: any) => {
    const value = item[field] || 'unknown';
    dist[value] = (dist[value] || 0) + 1;
    return dist;
  }, {});
}

async function getSyncMetrics() {
  try {
    const projects = await Project.find({}, 'lastSyncedAt syncStatus lastSyncError').lean();
    
    const successful = projects.filter((p: any) => p.syncStatus === 'synced').length;
    const failed = projects.filter((p: any) => p.syncStatus === 'sync_failed').length;
    const pending = projects.filter((p: any) => p.syncStatus === 'pending_sync').length;
    const notSynced = projects.filter((p: any) => !p.syncStatus || p.syncStatus === 'not_synced').length;
    
    const recentSyncErrors = projects
      .filter((p: any) => p.lastSyncError)
      .slice(0, 10)
      .map((p: any) => ({
        projectId: p._id?.toString() || 'unknown',
        error: p.lastSyncError,
        timestamp: p.lastSyncedAt || new Date()
      }));
    
    return {
      syncFrequency: {
        successful,
        failed,
        pending,
        notSynced,
        total: projects.length
      },
      recentErrors: recentSyncErrors,
      syncHealth: projects.length > 0 ? Math.round((successful / projects.length) * 100) : 100
    };
  } catch (error) {
    console.error('Error getting sync metrics:', error);
    return {
      syncFrequency: { successful: 0, failed: 0, pending: 0, notSynced: 0, total: 0 },
      recentErrors: [],
      syncHealth: 0
    };
  }
}

async function getTimeSeriesData(startDate: Date) {
  try {
    // Generate daily data points
    const dates: string[] = [];
    const currentDate = new Date(startDate);
    const endDate = new Date();
    
    while (currentDate <= endDate) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Get project creation data
    const projectCreationData = await getTimeSeriesCount(
      Project, 
      startDate, 
      'createdAt'
    );
    
    // Get task completion data
    const taskCompletionData = await getTimeSeriesCount(
      Task, 
      startDate, 
      'completedAt',
      { status: 'done' }
    );
    
    // Get sync activity data
    const syncActivityData = await getTimeSeriesCount(
      Project, 
      startDate, 
      'lastSyncedAt',
      { syncStatus: 'synced' }
    );
    
    return {
      projectCreation: projectCreationData,
      taskCompletion: taskCompletionData,
      syncActivity: syncActivityData.map((item: any) => ({
        date: item.date,
        syncs: item.count
      }))
    };
  } catch (error) {
    console.error('Error getting time series data:', error);
    return {
      projectCreation: [],
      taskCompletion: [],
      syncActivity: []
    };
  }
}

async function getTimeSeriesCount(
  model: any, 
  startDate: Date, 
  dateField: string, 
  filter: any = {}
) {
  try {
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
    return results.map((r: any) => ({ date: r._id, count: r.count }));
  } catch (error) {
    console.error('Error in getTimeSeriesCount:', error);
    return [];
  }
} 