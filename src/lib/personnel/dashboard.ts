import { connectToDatabase } from '../mongodb';
import Personnel, { IPersonnel } from '../models/Personnel';
import Project, { IProject } from '../models/Project';
import Task, { ITask } from '../models/Task';
import TimeEntry, { ITimeEntry } from '../models/TimeEntry';

export interface PerformanceMetrics {
  tasksCompleted: number;
  averageTaskTime: number;
  projectsContributed: number;
  teamCollaboration: number;
  skillGrowth: string[];
  totalHoursLogged: number;
  productivityScore: number;
}

export interface DashboardData {
  personnel: any;
  projects: any[];
  tasks: any[];
  metrics: PerformanceMetrics;
  recentActivity: any[];
}

export async function getPersonnelDashboardData(personnelId: string): Promise<DashboardData> {
  await connectToDatabase();

  try {
    const [personnel, projects, tasks, timeEntries] = await Promise.all([
      Personnel.findById(personnelId).lean(),
      Project.find({ 
        $or: [
          { 'team.members': personnelId },
          { 'team.lead': personnelId }
        ]
      }).lean(),
      Task.find({ 
        assignee: personnelId, 
        status: { $ne: 'completed' } 
      }).lean(),
      TimeEntry.find({ 
        personnelId, 
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
      }).lean()
    ]);

    if (!personnel) {
      throw new Error('Personnel not found');
    }

    const metrics = await calculatePersonnelMetrics(personnelId, timeEntries);
    const recentActivity = await getRecentActivity(personnelId);

    return {
      personnel,
      projects: projects || [],
      tasks: tasks || [],
      metrics,
      recentActivity
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}

export async function calculatePersonnelMetrics(
  personnelId: string, 
  timeEntries?: any[]
): Promise<PerformanceMetrics> {
  await connectToDatabase();

  try {
    // Get time entries if not provided
    if (!timeEntries) {
      timeEntries = await TimeEntry.find({
        personnelId,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }).lean();
    }

    // Get completed tasks
    const completedTasks = await Task.find({
      assignee: personnelId,
      status: 'completed',
      updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).lean();

    // Get projects contributed to
    const projects = await Project.find({
      $or: [
        { 'team.members': personnelId },
        { 'team.lead': personnelId }
      ]
    }).lean();

    // Calculate metrics
    const totalHoursLogged = (timeEntries || []).reduce((total: number, entry: any) => total + (entry.duration || 0), 0) / 60;
    const tasksCompleted = (completedTasks || []).length;
    const averageTaskTime = tasksCompleted > 0 
      ? (completedTasks || []).reduce((total: number, task: any) => total + (task.actualHours || 0), 0) / tasksCompleted 
      : 0;
    const projectsContributed = (projects || []).length;
    
    // Simple collaboration score based on comments and task interactions
    const teamCollaboration = (completedTasks || []).reduce((total: number, task: any) => total + (task.comments?.length || 0), 0);
    
    // Get personnel skills for growth tracking
    const personnel = await Personnel.findById(personnelId).lean();
    const skillGrowth = (personnel as any)?.profile?.skills || [];
    
    // Simple productivity score calculation
    const productivityScore = Math.min(100, (tasksCompleted * 10) + (totalHoursLogged * 2) + (teamCollaboration * 5));

    return {
      tasksCompleted,
      averageTaskTime,
      projectsContributed,
      teamCollaboration,
      skillGrowth,
      totalHoursLogged,
      productivityScore
    };
  } catch (error) {
    console.error('Error calculating metrics:', error);
    return {
      tasksCompleted: 0,
      averageTaskTime: 0,
      projectsContributed: 0,
      teamCollaboration: 0,
      skillGrowth: [],
      totalHoursLogged: 0,
      productivityScore: 0
    };
  }
}

export async function getRecentActivity(personnelId: string) {
  await connectToDatabase();

  try {
    const [recentTasks, recentTimeEntries, recentProjects] = await Promise.all([
      Task.find({ 
        assignee: personnelId,
        updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean(),
      
      TimeEntry.find({ 
        personnelId,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
      
      Project.find({
        $or: [
          { 'team.members': personnelId },
          { 'team.lead': personnelId }
        ],
        updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean()
    ]);

    // Combine and sort activities
    const activities = [
      ...(recentTasks || []).map((task: any) => ({
        type: 'task',
        title: `Updated task: ${task.title}`,
        timestamp: task.updatedAt,
        data: task
      })),
      ...(recentTimeEntries || []).map((entry: any) => ({
        type: 'time_entry',
        title: `Logged ${Math.round((entry.duration || 0) / 60 * 100) / 100} hours`,
        timestamp: entry.createdAt,
        data: entry
      })),
      ...(recentProjects || []).map((project: any) => ({
        type: 'project',
        title: `Project updated: ${project.name}`,
        timestamp: project.updatedAt,
        data: project
      }))
    ];

    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 15);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
}

export async function getTeamMembers(personnelId: string) {
  await connectToDatabase();

  try {
    const personnel = await Personnel.findById(personnelId).lean();
    if (!personnel) {
      return [];
    }

    // Get team members from the same department or projects
    const [departmentMembers, projectMembers] = await Promise.all([
      Personnel.find({ 
        department: (personnel as any).department,
        status: 'active',
        _id: { $ne: personnelId }
      }).lean(),
      
      Project.find({
        $or: [
          { 'team.members': personnelId },
          { 'team.lead': personnelId }
        ]
      }).lean().then(projects => {
        const allMembers = (projects || []).flatMap((p: any) => [...(p.team?.members || []), p.team?.lead].filter(Boolean));
        return Personnel.find({
          _id: { $in: allMembers, $ne: personnelId },
          status: 'active'
        }).lean();
      })
    ]);

    // Combine and deduplicate
    const allMembers = [...(departmentMembers || []), ...(projectMembers || [])];
    const uniqueMembers = allMembers.filter((member: any, index, self) => 
      index === self.findIndex((m: any) => String(m._id) === String(member._id))
    );

    return uniqueMembers;
  } catch (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
} 