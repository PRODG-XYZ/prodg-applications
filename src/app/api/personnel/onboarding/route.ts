import { NextRequest, NextResponse } from 'next/server';
import { PersonnelEmailService } from '@/lib/emails/personnel-email-service';
import { connectToDatabase } from '@/lib/mongodb';
import Personnel from '@/lib/models/Personnel';

// Handle personnel onboarding
export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Get personnel data from request
    const personnelData = await request.json();
    
    // Validate required fields
    if (!personnelData.applicationId || !personnelData.email || !personnelData.name) {
      return NextResponse.json(
        { success: false, error: 'Required fields missing' },
        { status: 400 }
      );
    }
    
    // Generate employee ID
    const employeeId = `EMP-${Date.now().toString().slice(-6)}`;
    
    // Create new personnel record
    const newPersonnel = new Personnel({
      applicationId: personnelData.applicationId,
      employeeId,
      email: personnelData.email,
      name: personnelData.name,
      role: personnelData.role || 'Developer',
      department: personnelData.department || 'Engineering',
      startDate: personnelData.startDate || new Date(),
      status: 'onboarding',
      profile: {
        skills: personnelData.skills || [],
        certifications: [],
        socialLinks: {
          github: personnelData.github || '',
          linkedin: personnelData.linkedin || '',
          portfolio: personnelData.portfolio || ''
        }
      },
      preferences: {
        timezone: 'UTC',
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
      }
    });
    
    // Save personnel record
    const savedPersonnel = await newPersonnel.save();
    
    // Send onboarding welcome email
    await PersonnelEmailService.sendOnboardingWelcomeEmail({
      id: savedPersonnel._id.toString(),
      name: savedPersonnel.name,
      email: savedPersonnel.email,
      role: savedPersonnel.role,
      department: savedPersonnel.department
    });
    
    return NextResponse.json({
      success: true,
      data: {
        id: savedPersonnel._id,
        employeeId: savedPersonnel.employeeId,
        name: savedPersonnel.name,
        email: savedPersonnel.email
      }
    });
  } catch (error) {
    console.error('Error creating personnel record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create personnel record' },
      { status: 500 }
    );
  }
}

// Get all personnel in onboarding status
export async function GET() {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Find all personnel in onboarding status
    const onboardingPersonnel = await Personnel.find({ status: 'onboarding' })
      .select('_id employeeId name email role department startDate onboarding')
      .sort({ startDate: -1 });
    
    return NextResponse.json({
      success: true,
      data: onboardingPersonnel
    });
  } catch (error) {
    console.error('Error fetching onboarding personnel:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch onboarding personnel' },
      { status: 500 }
    );
  }
} 