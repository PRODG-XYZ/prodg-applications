import { NextRequest, NextResponse } from 'next/server';
import { requireApplicantAuth } from '@/lib/applicant/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Application from '@/lib/models/Application';
import Personnel from '@/lib/models/Personnel';

/**
 * GET /api/debug/applicant-status
 * Debug endpoint to check the full status of an applicant and their personnel conversion status
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireApplicantAuth();
    
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    const applicationId = authResult.session?.applicationId;
    
    // Get the full application data
    const application = await Application.findById(applicationId);
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    // Check if a personnel record exists with this application ID
    const personnel = await Personnel.findOne({ applicationId });
    
    // Determine if we should show the personnel onboarding component
    const showPersonnelOnboarding = 
      application.status === 'approved' && 
      !!personnel;
    
    // Return detailed data for debugging
    return NextResponse.json({
      applicationId,
      applicationStatus: application.status,
      isApplicationApproved: application.status === 'approved',
      hasPersonnelRecord: !!personnel,
      personnelId: personnel ? personnel._id : null,
      shouldShowOnboarding: showPersonnelOnboarding,
      // Detailed data
      application: {
        _id: application._id,
        name: application.name,
        email: application.email,
        status: application.status,
        createdAt: application.createdAt
      },
      personnel: personnel ? {
        _id: personnel._id,
        name: personnel.name,
        email: personnel.email,
        role: personnel.role,
        department: personnel.department,
        status: personnel.status,
        employeeId: personnel.employeeId,
        applicationId: personnel.applicationId
      } : null
    });
  } catch (error) {
    console.error('Debug applicant status error:', error);
    return NextResponse.json(
      { error: 'Failed to check applicant status', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 