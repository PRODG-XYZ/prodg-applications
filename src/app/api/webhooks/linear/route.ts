import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Project, { IProject } from '@/lib/models/Project';
import Task, { ITask } from '@/lib/models/Task';
import LinearProjectSyncService from '@/lib/linear/projectSync';

interface LinearWebhookPayload {
  action: string;
  type: string;
  data: any;
  organizationId: string;
  webhookTimestamp: number;
  webhookId: string;
}

interface LinearIssueWebhook extends LinearWebhookPayload {
  type: 'Issue';
  data: {
    id: string;
    title: string;
    identifier: string;
    description?: string;
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
    project?: {
      id: string;
      name: string;
    };
    team: {
      id: string;
      name: string;
      key: string;
    };
  };
}

interface LinearProjectWebhook extends LinearWebhookPayload {
  type: 'Project';
  data: {
    id: string;
    name: string;
    description?: string;
    state: {
      id: string;
      name: string;
      type: string;
    };
    progress: number;
    startDate?: string;
    targetDate?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Verify webhook signature (in production, verify against Linear's webhook secret)
    const signature = request.headers.get('linear-signature');
    if (!signature) {
      console.warn('No Linear signature provided');
      // In development, we'll allow unsigned webhooks
      // In production, return 401 here
    }
    
    const payload: LinearWebhookPayload = await request.json();
    
    console.log(`Received Linear webhook: ${payload.type} - ${payload.action}`);
    
    // Handle different webhook types
    switch (payload.type) {
      case 'Issue':
        await handleIssueWebhook(payload as LinearIssueWebhook);
        break;
      case 'Project':
        await handleProjectWebhook(payload as LinearProjectWebhook);
        break;
      default:
        console.log(`Unhandled webhook type: ${payload.type}`);
    }
    
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Error processing Linear webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

async function handleIssueWebhook(webhook: LinearIssueWebhook) {
  const { action, data } = webhook;
  
  try {
    // Find existing task by Linear issue ID
    let task = await Task.findOne({ linearIssueId: data.id });
    
    switch (action) {
      case 'create':
        if (!task) {
          // Create new task from Linear issue
          const newTask = new Task({
            title: data.title,
            description: data.description || `Synced from Linear issue ${data.identifier}`,
            status: mapLinearStateToTaskStatus(data.state.name),
            priority: mapLinearPriorityToTask(data.priority),
            assignedTo: data.assignee ? await findPersonnelByEmail(data.assignee.email) : undefined,
            reporterId: 'system', // Default system user
            linearIssueId: data.id,
            linearIssueKey: data.identifier,
            linearProjectId: data.project?.id,
            linearStateId: data.state.id,
            syncEnabled: true,
            syncStatus: 'synced',
            lastSyncedAt: new Date(),
            createdBy: 'webhook',
            lastModifiedBy: 'webhook',
          });
          
          await newTask.save();
          console.log(`Created task from Linear issue ${data.identifier}`);
        }
        break;
        
      case 'update':
        if (task) {
          // Update existing task
          await Task.findByIdAndUpdate(task._id, {
            title: data.title,
            description: data.description || task.description,
            status: mapLinearStateToTaskStatus(data.state.name),
            priority: mapLinearPriorityToTask(data.priority),
            assignedTo: data.assignee ? await findPersonnelByEmail(data.assignee.email) : undefined,
            linearStateId: data.state.id,
            syncStatus: 'synced',
            lastSyncedAt: new Date(),
            lastModifiedBy: 'webhook',
          });
          
          console.log(`Updated task from Linear issue ${data.identifier}`);
        }
        break;
        
      case 'remove':
        if (task) {
          // Mark task as cancelled or delete based on preference
          await Task.findByIdAndUpdate(task._id, {
            status: 'cancelled',
            syncStatus: 'synced',
            lastSyncedAt: new Date(),
            lastModifiedBy: 'webhook',
          });
          
          console.log(`Marked task as cancelled from Linear issue ${data.identifier}`);
        }
        break;
    }
    
  } catch (error) {
    console.error('Error handling issue webhook:', error);
  }
}

async function handleProjectWebhook(webhook: LinearProjectWebhook) {
  const { action, data } = webhook;
  
  try {
    // Find existing project by Linear project ID
    let project = await Project.findOne({ linearProjectId: data.id });
    
    switch (action) {
      case 'create':
        // Projects are typically created from PeopleOS side
        console.log(`Linear project created: ${data.name} (${data.id})`);
        break;
        
      case 'update':
        if (project) {
          // Update existing project
          await Project.findByIdAndUpdate(project._id, {
            name: data.name,
            description: data.description || project.description,
            status: mapLinearStatusToProject(data.state.name),
            progress: data.progress || 0,
            startDate: data.startDate ? new Date(data.startDate) : project.startDate,
            endDate: data.targetDate ? new Date(data.targetDate) : project.endDate,
            syncStatus: 'synced',
            lastSyncedAt: new Date(),
            lastModifiedBy: 'webhook',
          });
          
          console.log(`Updated project from Linear: ${data.name}`);
        }
        break;
        
      case 'remove':
        if (project) {
          // Mark project as cancelled
          await Project.findByIdAndUpdate(project._id, {
            status: 'cancelled',
            syncStatus: 'synced',
            lastSyncedAt: new Date(),
            lastModifiedBy: 'webhook',
          });
          
          console.log(`Marked project as cancelled from Linear: ${data.name}`);
        }
        break;
    }
    
  } catch (error) {
    console.error('Error handling project webhook:', error);
  }
}

// Helper functions (same as in sync service)
function mapLinearStateToTaskStatus(state: string): ITask['status'] {
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

function mapLinearPriorityToTask(priority: number): ITask['priority'] {
  const priorityMap: Record<number, ITask['priority']> = {
    0: 'none',
    1: 'urgent',
    2: 'high',
    3: 'medium',
    4: 'low',
  };
  return priorityMap[priority] || 'medium';
}

function mapLinearStatusToProject(status: string): IProject['status'] {
  const statusMap: Record<string, IProject['status']> = {
    'planned': 'planning',
    'started': 'active',
    'paused': 'on_hold',
    'completed': 'completed',
    'canceled': 'cancelled',
  };
  return statusMap[status.toLowerCase()] || 'planning';
}

async function findPersonnelByEmail(email: string): Promise<string | undefined> {
  try {
    const Personnel = require('@/lib/models/Personnel').default;
    const personnel = await Personnel.findOne({ email });
    return personnel?._id?.toString();
  } catch (error) {
    console.error('Error finding personnel by email:', error);
    return undefined;
  }
} 