import { NextRequest, NextResponse } from 'next/server';
import { requireApplicantAuth } from '@/lib/applicant/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Personnel from '@/lib/models/Personnel';
import Application from '@/lib/models/Application';

/**
 * GET /api/debug/personnel-record-check
 * Directly checks if a personnel record exists for the current application ID
 * Only reports the existence, not the full record
 */
export async function GET(request: NextRequest) {
  try {
    console.log('Running personnel-record-check debug endpoint');
    
    const authResult = await requireApplicantAuth();
    
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const applicationId = authResult.session?.applicationId;
    console.log('Checking personnel for application ID:', applicationId);
    
    if (!applicationId) {
      return NextResponse.json(
        { error: 'No application ID found in session' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Get application status
    const application = await Application.findById(applicationId);
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    // Directly check if a personnel record exists with raw MongoDB query
    const personnel = await Personnel.findOne(
      { applicationId: applicationId.toString() },
      { _id: 1 } // Only retrieve the ID for efficiency
    );
    
    console.log('Raw check results:', {
      applicationId,
      applicationStatus: application.status,
      personnelExists: !!personnel,
      personnelId: personnel?._id?.toString()
    });
    
    return NextResponse.json({
      applicationId,
      applicationStatus: application.status,
      personnelExists: !!personnel,
      personnelId: personnel?._id?.toString()
    });
  } catch (error) {
    console.error('Personnel record check error:', error);
    return NextResponse.json(
      { error: 'Failed to check personnel record' },
      { status: 500 }
    );
  }
} 