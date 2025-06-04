import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Personnel from '@/lib/models/Personnel';
import Application from '@/lib/models/Application';

/**
 * GET /api/debug/personnel-check
 * Debug endpoint to check application and personnel status
 * Query params: 
 * - email: Email of the applicant to check
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // First, find the application with this email
    const application = await Application.findOne({ email });
    
    if (!application) {
      return NextResponse.json(
        { error: 'No application found with this email' },
        { status: 404 }
      );
    }
    
    // Then check if there's a personnel record with the application ID
    const personnel = await Personnel.findOne({ applicationId: application._id.toString() });
    
    return NextResponse.json({
      application: {
        _id: application._id,
        email: application.email,
        name: application.name,
        status: application.status,
        // Include other relevant application fields
      },
      isPersonnel: !!personnel,
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
    console.error('Debug personnel check error:', error);
    return NextResponse.json(
      { error: 'Failed to perform debug check' },
      { status: 500 }
    );
  }
} 