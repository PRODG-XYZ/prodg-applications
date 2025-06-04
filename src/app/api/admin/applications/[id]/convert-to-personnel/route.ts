import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Application from '@/lib/models/Application';
import Personnel from '@/lib/models/Personnel';
import Communication from '@/lib/models/Communication';

/**
 * POST /api/admin/applications/[id]/convert-to-personnel
 * Converts an approved application to a personnel record
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const applicationId = params.id;
    const { employeeId, role = 'employee', department } = await request.json();
    
    // Validate required fields
    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }
    
    if (!department) {
      return NextResponse.json(
        { error: 'Department is required' },
        { status: 400 }
      );
    }
    
    // Get the application
    const application = await Application.findById(applicationId);
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    // Check if application is approved
    if (application.status !== 'approved') {
      return NextResponse.json(
        { error: 'Only approved applications can be converted to personnel' },
        { status: 400 }
      );
    }
    
    // Check if a personnel record already exists for this application
    const existingPersonnel = await Personnel.findOne({ applicationId });
    
    if (existingPersonnel) {
      return NextResponse.json(
        { error: 'Personnel record already exists for this application', personnel: existingPersonnel },
        { status: 409 }
      );
    }
    
    // Check if employee ID already exists
    const duplicateEmployeeId = await Personnel.findOne({ employeeId });
    
    if (duplicateEmployeeId) {
      return NextResponse.json(
        { error: 'Employee ID already exists' },
        { status: 409 }
      );
    }
    
    // Create the personnel record
    const personnel = new Personnel({
      applicationId,
      employeeId,
      email: application.email,
      name: application.name,
      role,
      department,
      startDate: new Date(),
      status: 'onboarding',
      profile: {
        bio: application.backgroundDescription,
        skills: application.skills,
        socialLinks: {
          github: application.github,
          linkedin: application.linkedin,
          portfolio: application.portfolioUrl
        }
      },
      preferences: {
        timezone: 'America/New_York',
        workingHours: {
          start: '09:00',
          end: '17:00'
        },
        notifications: {
          email: true,
          push: true,
          slack: false
        }
      },
      onboarding: {
        tasksCompleted: [],
        documentsUploaded: [],
        meetingsScheduled: [],
        completionPercentage: 0
      },
      createdAt: new Date(),
      lastActiveAt: new Date()
    });
    
    await personnel.save();
    
    // Create a system message informing the applicant
    await Communication.create({
      applicationId,
      senderId: 'system',
      senderType: 'system',
      message: `Your personnel profile has been created. You now have access to the personnel dashboard. Your employee ID is ${employeeId}.`,
      messageType: 'personnel_created',
      timestamp: new Date(),
      isRead: false
    });
    
    return NextResponse.json({
      success: true,
      personnel
    });
  } catch (error) {
    console.error('Error converting application to personnel:', error);
    return NextResponse.json(
      { error: 'Failed to convert application to personnel' },
      { status: 500 }
    );
  }
} 