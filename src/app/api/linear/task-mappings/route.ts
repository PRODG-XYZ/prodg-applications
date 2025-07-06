import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import TaskLinearMapping from '@/lib/models/TaskLinearMapping';

export async function POST(request: NextRequest) {
  try {
    const { taskId, linearIssueId, linearIssueKey } = await request.json();
    
    if (!taskId || !linearIssueId || !linearIssueKey) {
      return NextResponse.json(
        { error: 'taskId, linearIssueId, and linearIssueKey are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Create or update mapping
    const mapping = await TaskLinearMapping.findOneAndUpdate(
      { taskId },
      {
        taskId,
        linearIssueId,
        linearIssueKey,
        syncStatus: 'synced',
        lastSyncedAt: new Date(),
      },
      { 
        upsert: true, 
        new: true 
      }
    );
    
    return NextResponse.json({ mapping });
  } catch (error) {
    console.error('Error creating task-linear mapping:', error);
    return NextResponse.json(
      { error: 'Failed to create mapping' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    
    await connectToDatabase();
    
    if (taskId) {
      // Get mapping for specific task
      const mapping = await TaskLinearMapping.findOne({ taskId });
      return NextResponse.json({ mapping });
    } else {
      // Get all mappings
      const mappings = await TaskLinearMapping.find({});
      return NextResponse.json({ mappings });
    }
  } catch (error) {
    console.error('Error fetching task-linear mappings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mappings' },
      { status: 500 }
    );
  }
} 