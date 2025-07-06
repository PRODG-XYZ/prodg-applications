import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import LinearProjectSyncService from '@/lib/linear/projectSync';

interface RouteParams {
  params: {
    id: string;
  };
}

// Manual sync project to Linear
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();
    
    const project = await Project.findById(params.id);
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    if (!project.linearProjectId) {
      return NextResponse.json(
        { error: 'Project is not linked to Linear' },
        { status: 400 }
      );
    }
    
    try {
      // Sync project to Linear
      await LinearProjectSyncService.syncProjectToLinear(params.id);
      
      // Sync project issues
      await LinearProjectSyncService.syncProjectIssues(params.id);
      
      // Get updated sync status
      const syncStatus = await LinearProjectSyncService.getProjectSyncStatus(params.id);
      
      return NextResponse.json({
        success: true,
        message: 'Project synced successfully',
        syncStatus
      });
      
    } catch (error) {
      console.error('Sync error:', error);
      return NextResponse.json(
        { error: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error syncing project:', error);
    return NextResponse.json(
      { error: 'Failed to sync project' },
      { status: 500 }
    );
  }
}

// Get sync status
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();
    
    const project = await Project.findById(params.id);
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    if (!project.linearProjectId) {
      return NextResponse.json({
        syncStatus: {
          connected: false,
          message: 'Project is not linked to Linear'
        }
      });
    }
    
    try {
      const syncStatus = await LinearProjectSyncService.getProjectSyncStatus(params.id);
      
      return NextResponse.json({
        syncStatus: {
          connected: true,
          ...syncStatus
        }
      });
      
    } catch (error) {
      console.error('Error getting sync status:', error);
      return NextResponse.json(
        { error: 'Failed to get sync status' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error fetching sync status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sync status' },
      { status: 500 }
    );
  }
} 