import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Application from '@/lib/models/Application';
import Personnel from '@/lib/models/Personnel';
import Communication from '@/lib/models/Communication';

/**
 * POST /api/debug/convert-applicant
 * Debug endpoint to convert an approved application to personnel
 * Body: 
 * - email: Email of the applicant to convert
 * - employeeId: Employee ID to assign
 * - department: Department to assign
 * - role: Role to assign (optional, defaults to 'employee')
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Starting debug convert-applicant process');
    
    const requestData = await request.json();
    const { email, department, role = 'employee' } = requestData;
    let { employeeId } = requestData;
    console.log('Request data:', { email, employeeId, department, role });
    
    // Validate required fields
    if (!email || !employeeId || !department) {
      console.error('Missing required fields');
      return NextResponse.json(
        { error: 'Email, employeeId, and department are required' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Find the application with this email
    const application = await Application.findOne({ email });
    console.log('Found application?', !!application, application?._id?.toString());
    
    if (!application) {
      console.error('No application found with email:', email);
      return NextResponse.json(
        { error: 'No application found with this email' },
        { status: 404 }
      );
    }
    
    // Check if application is approved
    if (application.status !== 'approved') {
      // For debugging purposes, let's update the application status to approved
      console.log('Application not approved, updating to approved');
      await Application.findByIdAndUpdate(
        application._id,
        { status: 'approved' },
        { new: true }
      );
      console.log(`Updated application ${application._id} status to approved`);
    }
    
    const applicationId = application._id.toString();
    console.log('Using applicationId:', applicationId);
    
    // Check if a personnel record already exists for this application
    let existingPersonnel = await Personnel.findOne({ applicationId });
    console.log('Existing personnel?', !!existingPersonnel);
    
    if (existingPersonnel) {
      console.log('Personnel record already exists:', existingPersonnel._id);
      return NextResponse.json(
        { 
          message: 'Personnel record already exists for this application', 
          personnel: existingPersonnel 
        },
        { status: 200 }
      );
    }
    
    // Check if employee ID already exists
    const duplicateEmployeeId = await Personnel.findOne({ employeeId });
    
    if (duplicateEmployeeId) {
      console.error('Employee ID already exists:', employeeId);
      // Generate a new unique employee ID to avoid conflicts
      const newEmployeeId = `EMP${Date.now().toString().slice(-8)}`;
      console.log('Generated new employeeId:', newEmployeeId);
      employeeId = newEmployeeId;
    }
    
    // Create the personnel record
    console.log('Creating new personnel record');
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
        bio: application.backgroundDescription || 'New team member',
        skills: application.skills || [],
        socialLinks: {
          github: application.github || '',
          linkedin: application.linkedin || '',
          portfolio: application.portfolioUrl || ''
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
    
    try {
      await personnel.save();
      console.log('Personnel record created successfully:', personnel._id);
    } catch (saveError) {
      console.error('Error saving personnel record:', saveError);
      return NextResponse.json(
        { error: 'Failed to save personnel record', details: saveError instanceof Error ? saveError.message : 'Unknown error' },
        { status: 500 }
      );
    }
    
    // Create a system message informing the applicant
    try {
      await Communication.create({
        applicationId,
        senderId: 'system',
        senderType: 'system',
        message: `Your personnel profile has been created. You now have access to the personnel dashboard. Your employee ID is ${employeeId}.`,
        messageType: 'personnel_created',
        timestamp: new Date(),
        isRead: false
      });
      console.log('Communication message created');
    } catch (commError) {
      console.error('Warning: Failed to create communication message:', commError);
      // Don't fail the entire request if just the message fails
    }
    
    // Double-check that the personnel record was created
    existingPersonnel = await Personnel.findOne({ applicationId });
    console.log('Verification - Personnel exists after creation?', !!existingPersonnel);
    
    return NextResponse.json({
      success: true,
      personnel
    });
  } catch (error) {
    console.error('Debug convert applicant error:', error);
    return NextResponse.json(
      { error: 'Failed to convert applicant to personnel', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 