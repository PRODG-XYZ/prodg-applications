import { LinearClient } from './client';
import Project, { IProject } from '../models/Project';
import Task, { ITask } from '../models/Task';
import LinearWorkspace from '../models/LinearWorkspace';

export interface LinearProjectData {
  id: string;
  name: string;
  description: string;
  state: {
    id: string;
    name: string;
    type: string;
  };
  startDate?: string;
  targetDate?: string;
  progress: number;
  url: string;
  teams: {
    id: string;
    name: string;
    key: string;
  }[];
  cycles: {
    id: string;
    name: string;
    startsAt: string;
    endsAt: string;
  }[];
  issues: {
    id: string;
    identifier: string;
    title: string;
    state: {
      id: string;
      name: string;
      color: string;
    };
    priority: number;
    assignee?: {
      id: string;
      name: string;
      email: string;
    };
  }[];
}

export class LinearProjectSyncService {
  private linearClient: LinearClient | null = null;

  constructor() {
    this.initializeClient();
  }

  private async initializeClient() {
    try {
      const workspace = await LinearWorkspace.findOne({ isConnected: true });
      if (workspace?.accessToken) {
        this.linearClient = new LinearClient(workspace.accessToken);
      }
    } catch (error) {
      console.error('Failed to initialize Linear client:', error);
    }
  }

  /**
   * Create a Linear project from a PeopleOS project
   */
  async createLinearProject(peopleOSProject: IProject, teamId: string): Promise<string> {
    if (!this.linearClient) {
      throw new Error('Linear client not initialized');
    }

    try {
      const projectData = {
        teamId,
        name: peopleOSProject.name,
        description: peopleOSProject.description,
        state: this.mapProjectStatusToLinear(peopleOSProject.status),
        startDate: peopleOSProject.startDate.toISOString(),
        targetDate: peopleOSProject.endDate?.toISOString(),
      };

      const linearProject = await this.linearClient.createProject(projectData);

      // Update PeopleOS project with Linear data
      await Project.findByIdAndUpdate(peopleOSProject._id, {
        linearProjectId: linearProject.id,
        linearTeamId: teamId,
        syncEnabled: true,
        syncStatus: 'synced',
        lastSyncedAt: new Date(),
      });

      console.log(`Created Linear project ${linearProject.id} for PeopleOS project ${peopleOSProject._id}`);
      return linearProject.id;
    } catch (error) {
      console.error('Error creating Linear project:', error);
      
      // Update project with sync error
      await Project.findByIdAndUpdate(peopleOSProject._id, {
        syncStatus: 'sync_failed',
        lastSyncError: error instanceof Error ? error.message : 'Unknown error',
      });
      
      throw error;
    }
  }

  /**
   * Sync a PeopleOS project to Linear
   */
  async syncProjectToLinear(projectId: string): Promise<void> {
    if (!this.linearClient) {
      throw new Error('Linear client not initialized');
    }

    try {
      const project = await Project.findById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      if (!project.linearProjectId) {
        throw new Error('Project not linked to Linear');
      }

      // Update Linear project
      await this.linearClient.updateProject(project.linearProjectId, {
        name: project.name,
        description: project.description,
        state: this.mapProjectStatusToLinear(project.status),
        startDate: project.startDate.toISOString(),
        targetDate: project.endDate?.toISOString(),
      });

      // Update sync status
      await Project.findByIdAndUpdate(projectId, {
        syncStatus: 'synced',
        lastSyncedAt: new Date(),
        lastSyncError: undefined,
      });

      console.log(`Synced project ${projectId} to Linear`);
    } catch (error) {
      console.error('Error syncing project to Linear:', error);
      
      await Project.findByIdAndUpdate(projectId, {
        syncStatus: 'sync_failed',
        lastSyncError: error instanceof Error ? error.message : 'Unknown error',
      });
      
      throw error;
    }
  }

  /**
   * Sync a Linear project to PeopleOS
   */
  async syncProjectFromLinear(linearProjectId: string): Promise<void> {
    if (!this.linearClient) {
      throw new Error('Linear client not initialized');
    }

    try {
      // Find existing project
      const project = await Project.findOne({ linearProjectId });
      if (!project) {
        throw new Error('Project not found in PeopleOS');
      }

      // Get Linear project data
      const linearProject = await this.linearClient.getProject(linearProjectId);
      
      // Update PeopleOS project
      await Project.findByIdAndUpdate(project._id, {
        name: linearProject.name,
        description: linearProject.description || project.description,
        status: this.mapLinearStatusToProject(linearProject.state.name),
        startDate: linearProject.startDate ? new Date(linearProject.startDate) : project.startDate,
        endDate: linearProject.targetDate ? new Date(linearProject.targetDate) : project.endDate,
        progress: linearProject.progress || 0,
        syncStatus: 'synced',
        lastSyncedAt: new Date(),
        lastSyncError: undefined,
      });

      console.log(`Synced Linear project ${linearProjectId} to PeopleOS`);
    } catch (error) {
      console.error('Error syncing project from Linear:', error);
      
      const project = await Project.findOne({ linearProjectId });
      if (project) {
        await Project.findByIdAndUpdate(project._id, {
          syncStatus: 'sync_failed',
          lastSyncError: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      
      throw error;
    }
  }

  /**
   * Sync all issues for a project
   */
  async syncProjectIssues(projectId: string): Promise<void> {
    if (!this.linearClient) {
      throw new Error('Linear client not initialized');
    }

    try {
      const project = await Project.findById(projectId);
      if (!project?.linearProjectId) {
        throw new Error('Project not linked to Linear');
      }

      // Get Linear issues
      const linearIssues = await this.linearClient.getProjectIssues(project.linearProjectId);
      
      // Get existing tasks
      const existingTasks = await Task.find({ projectId });

      for (const linearIssue of linearIssues) {
        // Check if task already exists
        let task = await Task.findOne({ linearIssueId: linearIssue.id });
        
        if (task) {
          // Update existing task
          await Task.findByIdAndUpdate(task._id, {
            title: linearIssue.title,
            status: this.mapLinearStateToTaskStatus(linearIssue.state.name),
            priority: this.mapLinearPriorityToTask(linearIssue.priority),
            assignedTo: linearIssue.assignee ? await this.findPersonnelByEmail(linearIssue.assignee.email) : undefined,
            syncStatus: 'synced',
            lastSyncedAt: new Date(),
          });
        } else {
          // Create new task
          const reporterId = project.createdBy; // Default to project creator
          
          task = new Task({
            title: linearIssue.title,
            description: `Synced from Linear issue ${linearIssue.identifier}`,
            status: this.mapLinearStateToTaskStatus(linearIssue.state.name),
            priority: this.mapLinearPriorityToTask(linearIssue.priority),
            projectId: project._id,
            assignedTo: linearIssue.assignee ? await this.findPersonnelByEmail(linearIssue.assignee.email) : undefined,
            reporterId,
            linearIssueId: linearIssue.id,
            linearIssueKey: linearIssue.identifier,
            linearProjectId: project.linearProjectId,
            linearStateId: linearIssue.state.id,
            syncEnabled: true,
            syncStatus: 'synced',
            lastSyncedAt: new Date(),
            createdBy: reporterId,
            lastModifiedBy: reporterId,
          });
          
          await task.save();
        }
      }

      console.log(`Synced ${linearIssues.length} issues for project ${projectId}`);
    } catch (error) {
      console.error('Error syncing project issues:', error);
      throw error;
    }
  }

  /**
   * Get project sync status and metrics
   */
  async getProjectSyncStatus(projectId: string): Promise<{
    project: IProject;
    linearProject?: LinearProjectData;
    syncMetrics: {
      lastSyncedAt?: Date;
      syncStatus: string;
      issueCount: number;
      syncedIssues: number;
      pendingSync: number;
      syncErrors: number;
    };
  }> {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    let linearProject: LinearProjectData | undefined;
    
    if (project.linearProjectId && this.linearClient) {
      try {
        linearProject = await this.linearClient.getProject(project.linearProjectId);
      } catch (error) {
        console.error('Error fetching Linear project:', error);
      }
    }

    const tasks = await Task.find({ projectId });
    const syncMetrics = {
      lastSyncedAt: project.lastSyncedAt,
      syncStatus: project.syncStatus,
      issueCount: tasks.length,
      syncedIssues: tasks.filter(t => t.syncStatus === 'synced').length,
      pendingSync: tasks.filter(t => t.syncStatus === 'pending_sync').length,
      syncErrors: tasks.filter(t => t.syncStatus === 'sync_failed').length,
    };

    return {
      project,
      linearProject,
      syncMetrics,
    };
  }

  // Helper methods for status mapping
  private mapProjectStatusToLinear(status: string): string {
    const statusMap: Record<string, string> = {
      'planning': 'planned',
      'active': 'started',
      'on_hold': 'paused',
      'completed': 'completed',
      'cancelled': 'canceled',
    };
    return statusMap[status] || 'planned';
  }

  private mapLinearStatusToProject(status: string): IProject['status'] {
    const statusMap: Record<string, IProject['status']> = {
      'planned': 'planning',
      'started': 'active',
      'paused': 'on_hold',
      'completed': 'completed',
      'canceled': 'cancelled',
    };
    return statusMap[status.toLowerCase()] || 'planning';
  }

  private mapLinearStateToTaskStatus(state: string): ITask['status'] {
    const stateMap: Record<string, ITask['status']> = {
      'backlog': 'backlog',
      'todo': 'todo',
      'in progress': 'in_progress',
      'in review': 'in_review',
      'done': 'done',
      'canceled': 'cancelled',
    };
    return stateMap[state.toLowerCase()] || 'backlog';
  }

  private mapLinearPriorityToTask(priority: number): ITask['priority'] {
    const priorityMap: Record<number, ITask['priority']> = {
      0: 'none',
      1: 'urgent',
      2: 'high',
      3: 'medium',
      4: 'low',
    };
    return priorityMap[priority] || 'medium';
  }

  private async findPersonnelByEmail(email: string): Promise<string | undefined> {
    try {
      const Personnel = require('../models/Personnel').default;
      const personnel = await Personnel.findOne({ email });
      return personnel?._id?.toString();
    } catch (error) {
      console.error('Error finding personnel by email:', error);
      return undefined;
    }
  }
}

export default new LinearProjectSyncService(); 