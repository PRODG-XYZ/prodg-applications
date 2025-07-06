import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Project, { IProject } from '@/lib/models/Project';
import LinearProjectSyncService from '@/lib/linear/projectSync';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');
    const status = searchParams.get('status');
    const teamLeadId = searchParams.get('teamLeadId');
    const syncStatus = searchParams.get('syncStatus');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Build filter
    const filter: any = {};
    if (departmentId) filter.departmentId = departmentId;
    if (status) filter.status = status;
    if (teamLeadId) filter.teamLeadId = teamLeadId;
    if (syncStatus) filter.syncStatus = syncStatus;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute query with pagination
    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate('teamLead', 'name email')
        .populate('department', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Project.countDocuments(filter)
    ]);
    
    return NextResponse.json({
      projects,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: projects.length,
        totalCount: total
      }
    });
    
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const {
      name,
      description,
      status = 'planning',
      priority = 'medium',
      departmentId,
      teamLeadId,
      members = [],
      startDate,
      endDate,
      budget,
      tags = [],
      linearTeamId,
      enableLinearSync = false,
      createdBy
    } = body;
    
    // Validation
    if (!name || !description || !departmentId || !startDate || !createdBy) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, departmentId, startDate, createdBy' },
        { status: 400 }
      );
    }
    
    // Create project
    const project = new Project({
      name,
      description,
      status,
      priority,
      departmentId,
      teamLeadId,
      members,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      budget,
      tags,
      linearTeamId,
      syncEnabled: enableLinearSync,
      createdBy,
      lastModifiedBy: createdBy,
    });
    
    await project.save();
    
    // Create Linear project if enabled
    if (enableLinearSync && linearTeamId) {
      try {
        const linearProjectId = await LinearProjectSyncService.createLinearProject(project, linearTeamId);
        console.log(`Created Linear project ${linearProjectId} for project ${project._id}`);
      } catch (error) {
        console.error('Failed to create Linear project:', error);
        // Update project with sync error but don't fail the request
        await Project.findByIdAndUpdate(project._id, {
          syncStatus: 'sync_failed',
          lastSyncError: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // Populate and return the created project
    const populatedProject = await Project.findById(project._id)
      .populate('teamLead', 'name email')
      .populate('department', 'name code');
    
    return NextResponse.json({
      success: true,
      project: populatedProject,
      message: 'Project created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
} 