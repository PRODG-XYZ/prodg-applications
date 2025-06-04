import { NextRequest, NextResponse } from 'next/server';
import { requireApplicantAuth } from '@/lib/applicant/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Personnel from '@/lib/models/Personnel';

/**
 * GET /api/applicant/personnel-status
 * Checks if the current applicant has been converted to personnel
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
    
    console.log('Checking personnel status for application ID:', applicationId);
    
    if (!applicationId) {
      console.error('No application ID found in session');
      return NextResponse.json(
        { error: 'No application ID found in session' },
        { status: 400 }
      );
    }
    
    // Check if a personnel record exists with this application ID
    const personnel = await Personnel.findOne({ applicationId });
    
    console.log('Personnel record found?', !!personnel, personnel?._id ? personnel._id.toString() : null);
    
    const result = {
      isPersonnel: !!personnel,
      personnel: personnel ? {
        _id: personnel._id,
        name: personnel.name,
        email: personnel.email,
        role: personnel.role,
        department: personnel.department,
        status: personnel.status,
        employeeId: personnel.employeeId
      } : null
    };
    
    console.log('Returning personnel status:', result);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Personnel status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check personnel status' },
      { status: 500 }
    );
  }
} 