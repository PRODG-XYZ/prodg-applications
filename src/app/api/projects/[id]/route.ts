import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Project, { IProject } from '@/lib/models/Project';
import Task from '@/lib/models/Task';
import LinearProjectSyncService from '@/lib/linear/projectSync';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();
    
    const project = await Project.findById(params.id)
      .populate('teamLead', 'name email avatarUrl')
      .populate('department', 'name code')
      .lean() as (IProject & { 
        teamLead?: { name: string; email: string; avatarUrl?: string };
        department?: { name: string; code: string };
      }) | null;
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Get related tasks
    const tasks = await Task.find({ projectId: params.id })
      .populate('assignee', 'name email')
      .populate('reporter', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    
    // Get Linear sync status if connected
    let syncStatus = null;
    if (project.linearProjectId) {
      try {
        syncStatus = await LinearProjectSyncService.getProjectSyncStatus(params.id);
      } catch (error) {
        console.error('Error getting sync status:', error);
      }
    }
    
    return NextResponse.json({
      project,
      tasks,
      syncStatus
    });
    
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { lastModifiedBy, ...updateData } = body;
    
    if (!lastModifiedBy) {
      return NextResponse.json(
        { error: 'lastModifiedBy is required' },
        { status: 400 }
      );
    }
    
    // Prepare update data
    const update = {
      ...updateData,
      lastModifiedBy,
      updatedAt: new Date()
    };
    
    // Handle dates
    if (update.startDate) update.startDate = new Date(update.startDate);
    if (update.endDate) update.endDate = new Date(update.endDate);
    
    const project = await Project.findByIdAndUpdate(
      params.id,
      update,
      { new: true, runValidators: true }
    ).populate('teamLead', 'name email')
      .populate('department', 'name code') as IProject | null;
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Sync to Linear if enabled
    if (project.syncEnabled && project.linearProjectId) {
      try {
        await LinearProjectSyncService.syncProjectToLinear(params.id);
      } catch (error) {
        console.error('Failed to sync project to Linear:', error);
        // Don't fail the request, just log the error
      }
    }
    
    return NextResponse.json({
      success: true,
      project,
      message: 'Project updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();
    
    const project = await Project.findById(params.id);
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Delete related tasks
    await Task.deleteMany({ projectId: params.id });
    
    // Delete the project
    await Project.findByIdAndDelete(params.id);
    
    // TODO: Handle Linear project deletion if needed
    // Note: We might want to keep Linear projects for historical purposes
    
    return NextResponse.json({
      success: true,
      message: 'Project and related tasks deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
} 