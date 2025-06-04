import { NextRequest, NextResponse } from 'next/server';
import { withPersonnelAuth } from '@/lib/personnel/auth';
import { connectToDatabase } from '@/lib/mongodb';
import TimeEntry from '@/lib/models/TimeEntry';
import Project from '@/lib/models/Project';
import Task from '@/lib/models/Task';

export async function GET(request: NextRequest) {
  try {
    const { session, response } = await withPersonnelAuth()(request);
    
    if (response) return response;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const projectId = searchParams.get('projectId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    // Build query
    const query: any = { personnelId: session.personnelId };
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    if (projectId) {
      query.projectId = projectId;
    }

    const entries = await TimeEntry.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const total = await TimeEntry.countDocuments(query);

    // Get total hours for the period
    const totalHours = entries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60;

    return NextResponse.json({
      success: true,
      entries,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      summary: {
        totalEntries: total,
        totalHours: Math.round(totalHours * 100) / 100
      }
    });
  } catch (error) {
    console.error('Get time entries error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, response } = await withPersonnelAuth()(request);
    
    if (response) return response;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.projectId || !data.startTime) {
      return NextResponse.json(
        { error: 'Project and start time are required' },
        { status: 400 }
      );
    }

    // Verify project access
    const project = await Project.findOne({
      _id: data.projectId,
      $or: [
        { 'team.members': session.personnelId },
        { 'team.lead': session.personnelId }
      ]
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 403 }
      );
    }

    // Verify task access if provided
    if (data.taskId) {
      const task = await Task.findOne({
        _id: data.taskId,
        projectId: data.projectId,
        assignee: session.personnelId
      });

      if (!task) {
        return NextResponse.json(
          { error: 'Task not found or not assigned to you' },
          { status: 403 }
        );
      }
    }

    // Create time entry
    const timeEntry = new TimeEntry({
      personnelId: session.personnelId,
      projectId: data.projectId,
      taskId: data.taskId,
      description: data.description || 'Work session',
      startTime: new Date(data.startTime),
      endTime: data.endTime ? new Date(data.endTime) : undefined,
      duration: data.duration || 0,
      type: data.type || 'work',
      isApproved: false
    });

    await timeEntry.save();

    // Update task actual hours if task is provided
    if (data.taskId && data.duration) {
      await Task.findByIdAndUpdate(data.taskId, {
        $inc: { actualHours: data.duration / 60 }
      });
    }

    // Update project actual hours
    if (data.duration) {
      await Project.findByIdAndUpdate(data.projectId, {
        $inc: { actualHours: data.duration / 60 }
      });
    }

    return NextResponse.json({
      success: true,
      entry: timeEntry,
      message: 'Time entry created successfully'
    });
  } catch (error) {
    console.error('Create time entry error:', error);
    return NextResponse.json(
      { error: 'Failed to create time entry' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { session, response } = await withPersonnelAuth()(request);
    
    if (response) return response;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('id');
    const updates = await request.json();

    if (!entryId) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    // Find and verify ownership
    const timeEntry = await TimeEntry.findOne({
      _id: entryId,
      personnelId: session.personnelId
    });

    if (!timeEntry) {
      return NextResponse.json(
        { error: 'Time entry not found' },
        { status: 404 }
      );
    }

    // Prevent updates to approved entries unless user has approval permissions
    if (timeEntry.isApproved && !session.permissions.canApproveTimesheet) {
      return NextResponse.json(
        { error: 'Cannot modify approved time entries' },
        { status: 403 }
      );
    }

    // Update allowed fields
    const allowedUpdates: any = {};
    if (updates.description !== undefined) allowedUpdates.description = updates.description;
    if (updates.endTime !== undefined) allowedUpdates.endTime = new Date(updates.endTime);
    if (updates.duration !== undefined) allowedUpdates.duration = updates.duration;
    if (updates.type !== undefined) allowedUpdates.type = updates.type;
    
    // Only allow approval by users with permission
    if (updates.isApproved !== undefined && session.permissions.canApproveTimesheet) {
      allowedUpdates.isApproved = updates.isApproved;
      if (updates.isApproved) {
        allowedUpdates.approvedBy = session.personnelId;
      }
    }

    const updatedEntry = await TimeEntry.findByIdAndUpdate(
      entryId,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    ).lean();

    return NextResponse.json({
      success: true,
      entry: updatedEntry,
      message: 'Time entry updated successfully'
    });
  } catch (error) {
    console.error('Update time entry error:', error);
    return NextResponse.json(
      { error: 'Failed to update time entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { session, response } = await withPersonnelAuth()(request);
    
    if (response) return response;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('id');

    if (!entryId) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    // Find and verify ownership
    const timeEntry = await TimeEntry.findOne({
      _id: entryId,
      personnelId: session.personnelId
    });

    if (!timeEntry) {
      return NextResponse.json(
        { error: 'Time entry not found' },
        { status: 404 }
      );
    }

    // Prevent deletion of approved entries
    if (timeEntry.isApproved) {
      return NextResponse.json(
        { error: 'Cannot delete approved time entries' },
        { status: 403 }
      );
    }

    await TimeEntry.findByIdAndDelete(entryId);

    return NextResponse.json({
      success: true,
      message: 'Time entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete time entry error:', error);
    return NextResponse.json(
      { error: 'Failed to delete time entry' },
      { status: 500 }
    );
  }
} 